const jwt = require('jsonwebtoken');

function signAccess(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefresh(payload, secret, expiresIn) {
  return jwt.sign({ ...payload, typ: 'refresh' }, secret, { expiresIn });
}

function verifyAccess(token, secret) {
  return jwt.verify(token, secret);
}

function verifyRefresh(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
