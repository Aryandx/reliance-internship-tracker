const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../users/user.model');

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

const signAccess = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TTL });

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  const accessToken = signAccess(user._id, user.role);
  const refreshToken = signRefresh(user._id);
  return { accessToken, refreshToken, user };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const match = await user.comparePassword(password);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccess(user._id, user.role);
  const refreshToken = signRefresh(user._id);
  // Strip passwordHash before returning
  const userObj = user.toJSON();
  return { accessToken, refreshToken, user: userObj };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw Object.assign(new Error('Refresh token required'), { status: 401 });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new Error('User not found');
    const accessToken = signAccess(user._id, user.role);
    return { accessToken };
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 });
  }
};

module.exports = { register, login, refresh, signAccess };
