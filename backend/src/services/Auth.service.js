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
    const count = await User.countDocuments();
    if (count === 0) {
      const user = new User({ name: 'Admin', pin: env.ADMIN_PIN });
      await user.save();
      console.log('[Auth] Default admin created');
    }
  }

  async login(pin) {
    const user = await User.findOne().select('+pin +refreshToken');
    if (!user) throw ApiError.unauthorized('No admin account found');

    const valid = await user.comparePin(pin);
    if (!valid) throw ApiError.unauthorized('Invalid PIN');

    const accessToken = this._signAccess(user._id);
    const refreshToken = this._signRefresh(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, role: user.role },
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
}

module.exports = new AuthService();
