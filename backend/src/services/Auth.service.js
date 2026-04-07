const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

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

  async login(pin, name = null) {
    let user;
    
    // 1. Precise Lookup if Name provided (Secure Pattern)
    if (name) {
      user = await User.findOne({ name }).select('+pin +refreshToken');
    } else {
      // 2. Single-Tenant Fallback (Common for industrial billing)
      // If exactly one user exists, we can identify them solely by PIN pad
      const userCount = await User.countDocuments();
      if (userCount === 1) {
        user = await User.findOne().select('+pin +refreshToken');
      } else {
        // Multi-tenant systems MUST provide a name for security.
        throw ApiError.unauthorized('PLEASE PROVIDE OWNER NAME FOR SYSTEM IDENTIFICATION');
      }
    }

    if (!user) throw ApiError.unauthorized('ACCOUNT NOT FOUND');

    // Compare Bcrypt Hash (Secure Match)
    const isMatch = await user.comparePin(String(pin));
    if (!isMatch) throw ApiError.unauthorized('INVALID SECURITY PIN');

    // Ensure the PIN is hashed if it wasn't (Auto-Migration)
    const isActuallyHashed = String(user.pin).startsWith('$2'); 
    if (!isActuallyHashed) {
      user.pin = pin;
      await user.save();
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

  async signup(name, pin) {
    const exists = await User.findOne({ name });
    if (exists) throw ApiError.badRequest('Owner Name already registered');

    const user = new User({ name, pin });
    await user.save();

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
