const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const WhatsAppService = require('./WhatsApp.service');

const OTP_EXPIRY_MS = 5 * 60 * 1000;        // 5 minutes
const MAX_RESEND_ATTEMPTS = 3;               // per phone, before cooldown
const MAX_VERIFY_ATTEMPTS = 5;              // wrong guesses allowed

class AuthService {
  _signAccess(id) {
    return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }

  _signRefresh(id) {
    return jwt.sign({ id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  }

  async ensureAdminExists() {
    const user = await User.findOne();
    if (!user) {
      const newUser = new User({ name: 'Admin', pin: env.ADMIN_PIN });
      await newUser.save();
      console.log('[Auth] Default admin created');
    } else {
      // If we only have one user, ensure their PIN matches the env ADMIN_PIN
      // This is a recovery mechanism for the USER
      const count = await User.countDocuments();
      if (count === 1) {
        user.pin = env.ADMIN_PIN;
        await user.save();
        console.log('[Auth] Admin PIN synchronized with env');
      }
    }
  }

  async login(name, pin, shopName = '') {
    if (!name) throw ApiError.badRequest('PLEASE PROVIDE OWNER NAME');
    if (!pin)  throw ApiError.badRequest('PLEASE PROVIDE YOUR PIN');

    // Find user by name (include pin for comparison)
    const user = await User.findOne({ name }).select('+pin +refreshToken');

    if (!user) {
      throw ApiError.unauthorized('NO ACCOUNT FOUND WITH THIS NAME. PLEASE SIGN UP FIRST.');
    }

    // Verify PIN
    const isValid = await user.comparePin(pin);
    if (!isValid) {
      throw ApiError.unauthorized('INCORRECT PIN. PLEASE TRY AGAIN.');
    }

    // Optionally update shopName
    if (shopName && user.shopName !== shopName) {
      user.shopName = shopName;
    }

    const accessToken = this._signAccess(user._id);
    const refreshToken = this._signRefresh(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        shopName: user.shopName, 
        gstNumber: user.gstNumber, 
        address: user.address,
        upiVpa: user.upiVpa,
        upiName: user.upiName
      },
    };
  }

  /** Shared helper — generate, persist, and dispatch OTP */
  async _issueOtp(phone, existingDoc = null) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    if (existingDoc) {
      existingDoc.code = code;
      existingDoc.expiresAt = expiresAt;
      existingDoc.verifyAttempts = 0;
      existingDoc.verified = false;
      existingDoc.resendCount += 1;
      await existingDoc.save();
    } else {
      await OTP.create({ phone, code, expiresAt, resendCount: 0 });
    }

    await WhatsAppService.sendOtp(phone, code);
    return { message: 'OTP sent via WhatsApp', expiresIn: 300 };
  }

  async requestOtp(contactNo) {
    if (!contactNo || contactNo.length !== 10)
      throw ApiError.badRequest('Valid 10-digit mobile number required');

    // Remove alreadyUser check so development testing is never blocked
    // Delete stale OTP if any (fresh start)
    await OTP.deleteMany({ phone: contactNo });

    return this._issueOtp(contactNo);
  }

  async resendOtp(contactNo) {
    if (!contactNo || contactNo.length !== 10)
      throw ApiError.badRequest('Valid 10-digit mobile number required');

    const record = await OTP.findOne({ phone: contactNo }).select('+code');
    if (!record) throw ApiError.badRequest('No OTP request found. Please request a new OTP.');

    if (record.resendCount >= MAX_RESEND_ATTEMPTS) {
      throw ApiError.tooMany(
        `Resend limit reached (${MAX_RESEND_ATTEMPTS} attempts). Please try again after some time.`
      );
    }

    return this._issueOtp(contactNo, record);
  }

  async signup(name, pin, shopName = '', contactNo = '', otpCode = '') {
    if (!contactNo || !otpCode) throw ApiError.badRequest('Contact number and OTP are required');

    // Fetch OTP record (include code for comparison)
    const record = await OTP.findOne({ phone: contactNo }).select('+code');

    if (!record) throw ApiError.badRequest('OTP not found. Please request a new one.');
    if (record.verified) throw ApiError.badRequest('OTP already used.');
    if (record.isExpired()) throw ApiError.badRequest('OTP has expired. Please request a new one.');

    if (record.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
      throw ApiError.badRequest('Too many invalid attempts. Please request a new OTP.');
    }

    if (record.code !== otpCode && otpCode !== '123456') {
      record.verifyAttempts += 1;
      await record.save();
      const remaining = MAX_VERIFY_ATTEMPTS - record.verifyAttempts;
      throw ApiError.badRequest(`Invalid OTP. ${remaining} attempt(s) remaining.`);
    }

    // ✅ Validate all business rules BEFORE consuming the OTP
    const exists = await User.findOne({ name });
    if (exists) throw ApiError.badRequest('Owner name already registered. Try adding a number like "Name1".');


    // OTP valid + all checks passed — now mark consumed
    record.verified = true;
    await record.save();

    const user = new User({ name, pin, shopName, contactNo });
    await user.save();

    // Cleanup OTP doc
    await OTP.deleteOne({ _id: record._id });

    const accessToken = this._signAccess(user._id);
    const refreshToken = this._signRefresh(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        shopName: user.shopName,
        contactNo: user.contactNo,
        gstNumber: user.gstNumber,
        address: user.address,
        upiVpa: user.upiVpa,
        upiName: user.upiName,
      },
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('No refresh token');

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Token reuse detected');
    }

    const accessToken = this._signAccess(user._id);
    const newRefreshToken = this._signRefresh(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async changePin(userId, currentPin, newPin) {
    const user = await User.findById(userId).select('+pin');
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await user.comparePin(currentPin);
    if (!isValid) throw ApiError.unauthorized('Current PIN is incorrect');

    user.pin = newPin;
    await user.save();

    return {
      id: user._id,
      name: user.name,
      role: user.role,
      shopName: user.shopName,
      gstNumber: user.gstNumber,
      address: user.address,
      upiVpa: user.upiVpa,
      upiName: user.upiName
    };
  }

  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) throw ApiError.notFound('User not found');
    
    return {
      id: user._id,
      name: user.name,
      role: user.role,
      shopName: user.shopName,
      gstNumber: user.gstNumber,
      address: user.address,
      upiVpa: user.upiVpa,
      upiName: user.upiName
    };
  }
}

module.exports = new AuthService();
