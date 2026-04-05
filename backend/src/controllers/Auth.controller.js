const authService = require('../services/Auth.service');
const { asyncHandler } = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  authService.setRefreshCookie(res, result.refreshToken);
  res.status(201).json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  authService.setRefreshCookie(res, result.refreshToken);
  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshTokens(req);
  authService.setRefreshCookie(res, result.refreshToken);
  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.sub);
  authService.clearRefreshCookie(res);
  res.json({ ok: true });
});
