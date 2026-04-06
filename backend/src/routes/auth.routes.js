const { Router } = require('express');
const { z } = require('zod');
const authController = require('../controllers/Auth.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

const loginSchema = z.object({ pin: z.string().length(6, 'PIN must be 6 digits') });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', validate(refreshSchema), authController.refresh.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));

module.exports = router;
