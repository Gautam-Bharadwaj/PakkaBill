const { Router } = require('express');
const { validateBody } = require('../middleware/validate.middleware');
const validators = require('../validators');
const Auth = require('../controllers/Auth.controller');

const r = Router();

r.post('/register', validateBody(validators.register), Auth.register);
r.post('/login', validateBody(validators.login), Auth.login);
r.post('/refresh', validateBody(validators.refresh), Auth.refresh);

module.exports = r;
