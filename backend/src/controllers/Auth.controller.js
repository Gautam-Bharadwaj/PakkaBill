const authService = require('../services/Auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  async login(req, res, next) {
    try {
      const { pin } = req.body;
      const result = await authService.login(pin);
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
}

module.exports = new AuthController();
