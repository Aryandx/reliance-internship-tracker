const authService = require('./auth.service');
const User = require('../users/user.model');
const bcrypt = require('bcryptjs');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const logout = async (req, res) => {
  // Stateless JWT — client discards tokens; could blacklist refresh token here
  res.json({ success: true, message: 'Logged out' });
};

const me = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;
    const users = await User.find(filter).sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

module.exports = { register, login, refresh, logout, me, updateProfile, getUsers };
