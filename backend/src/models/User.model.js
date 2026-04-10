const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    pin: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
    shopName: { type: String, default: '' },
    contactNo: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    upiVpa: { type: String, default: '' },
    upiName: { type: String, default: 'PakkaBill' },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  this.pin = await bcrypt.hash(this.pin, 12);
  next();
});

userSchema.methods.comparePin = async function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
