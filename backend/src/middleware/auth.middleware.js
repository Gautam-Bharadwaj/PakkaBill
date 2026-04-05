const { verifyAccess } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    req.user = verifyAccess(token, secret);
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
