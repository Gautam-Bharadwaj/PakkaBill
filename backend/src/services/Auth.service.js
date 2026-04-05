const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { UserRepository } = require('../repositories/User.repository');
const { ApiError } = require('../utils/ApiError');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');

const userRepo = new UserRepository();

function hashRefresh(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const COOKIE_NAME = 'refreshToken';

function getRefreshFromRequest(req) {
  return req.body?.refreshToken || req.cookies?.[COOKIE_NAME];
}

class AuthService {
  async register({ phone, pin }) {
    const count = await userRepo.countUsers();
    if (count > 0) throw ApiError.forbidden('Registration disabled — owner already exists');

    const pinHash = await bcrypt.hash(pin, 12);
    const user = await userRepo.create({ phone, pinHash });
    const tokens = await this.#issueTokens(user);
    return { user: { phone: user.phone }, ...tokens };
  }

  async login({ phone, pin }) {
    const user = await userRepo.findByPhone(phone);
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    return this.#issueTokens(user);
  }

  async #issueTokens(user) {
    const accessToken = signAccess(
      { sub: String(user._id), phone: user.phone },
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_ACCESS_EXPIRES || '15m'
    );
    const refreshToken = signRefresh(
      { sub: String(user._id) },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES || '7d'
    );
    user.refreshTokenHash = hashRefresh(refreshToken);
    await user.save();
    return { accessToken, refreshToken, user: { phone: user.phone } };
  }

  async refreshTokens(req) {
    const refreshToken = getRefreshFromRequest(req);
    if (!refreshToken) throw ApiError.unauthorized('Invalid refresh token');
    let payload;
    try {
      payload = verifyRefresh(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const user = await userRepo.findById(payload.sub);
    if (!user || user.refreshTokenHash !== hashRefresh(refreshToken)) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const accessToken = signAccess(
      { sub: String(user._id), phone: user.phone },
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_ACCESS_EXPIRES || '15m'
    );
    const newRefresh = signRefresh(
      { sub: String(user._id) },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES || '7d'
    );
    user.refreshTokenHash = hashRefresh(newRefresh);
    await user.save();
    return { accessToken, refreshToken: newRefresh };
  }

  async logout(userId) {
    const user = await userRepo.findById(userId);
    if (user) {
      user.refreshTokenHash = null;
      await user.save();
    }
    return { ok: true };
  }

  setRefreshCookie(res, refreshToken) {
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
    });
  }

  clearRefreshCookie(res) {
    res.clearCookie(COOKIE_NAME);
  }
}

module.exports = new AuthService();
