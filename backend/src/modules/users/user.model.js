const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['HR', 'MANAGER', 'TECH_LEAD', 'BUDDY', 'INTERN'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, required: true },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.passwordHash;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
  }
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
