const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    pinHash: { type: String, required: true },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
