const mongoose = require('mongoose');

/**
 * OTP Document lifecycle:
 *  - Created on requestOtp / resendOtp
 *  - Verified on verifyOtp (inline during signup)
 *  - Expired automatically via TTL index (expiresAt)
 *
 * Guards:
 *  - expiresAt: 5-minute window enforced by TTL + manual check
 *  - resendCount: max 3 resends per phone (resets on new clean request)
 *  - verifyAttempts: max 5 wrong guesses before locked
 */
const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
    select: false, // Never leak OTP in API responses
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL — doc auto-deleted after expiresAt
  },
  resendCount: { type: Number, default: 0 },
  verifyAttempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

// Convenience: check if OTP is still alive
otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('OTP', otpSchema);
