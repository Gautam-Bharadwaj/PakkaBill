const authService = require('../services/Auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  async signup(req, res, next) {
    try {
      const { name, pin, shopName, contactNo, otpCode } = req.body;
      const result = await authService.signup(name, pin, shopName, contactNo, otpCode);
      ApiResponse.success(res, result, 'Account created successfully');
    } catch (err) {
      next(err);
    }
  }

  async requestOtp(req, res, next) {
    try {
      const { contactNo } = req.body;
      const result = await authService.requestOtp(contactNo);
      ApiResponse.success(res, result, 'OTP sent via WhatsApp');
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(req, res, next) {
    try {
      const { contactNo } = req.body;
      const result = await authService.resendOtp(contactNo);
      ApiResponse.success(res, result, 'OTP resent via WhatsApp');
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { name, pin, shopName } = req.body;
      const result = await authService.login(name, pin, shopName);
      ApiResponse.success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      ApiResponse.success(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user._id);
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async changePin(req, res, next) {
    try {
      const { currentPin, newPin } = req.body;
      const result = await authService.changePin(req.user._id, currentPin, newPin);
      ApiResponse.success(res, result, 'PIN updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await authService.updateProfile(req.user._id, req.body);
      ApiResponse.success(res, result, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
