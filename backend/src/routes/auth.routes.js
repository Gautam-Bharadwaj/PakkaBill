const { Router } = require('express');
const { z } = require('zod');
const authController = require('../controllers/Auth.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
  shopName: z.string().optional(),
  contactNo: z.string().length(10, 'Contact number must be exactly 10 digits'),
  otpCode: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});
const loginSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
  shopName: z.string().optional(),
});
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const changePinSchema = z.object({
  currentPin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
  newPin: z.string().regex(/^\d{6}$/, 'New PIN must be 6 digits'),
});
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  shopName: z.string().optional(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  upiVpa: z.string().optional(),
  upiName: z.string().optional(),
});

const otpPhoneSchema = z.object({
  contactNo: z.string().length(10, 'Contact number must be exactly 10 digits'),
});

// Auth routes
router.post('/request-otp', authLimiter, validate(otpPhoneSchema), authController.requestOtp.bind(authController));
router.post('/resend-otp',  authLimiter, validate(otpPhoneSchema), authController.resendOtp.bind(authController));
router.post('/signup',      authLimiter, validate(signupSchema),   authController.signup.bind(authController));
router.post('/login',       authLimiter, validate(loginSchema),    authController.login.bind(authController));
router.post('/refresh',     validate(refreshSchema),               authController.refresh.bind(authController));
router.post('/logout',      authMiddleware,                        authController.logout.bind(authController));
router.patch('/change-pin', authMiddleware, validate(changePinSchema),    authController.changePin.bind(authController));
router.put('/update-profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile.bind(authController));

module.exports = router;

