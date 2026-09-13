const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/token');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function sendAuth(res, user, status = 200) {
  const token = signToken({ id: user._id.toString(), role: user.role });
  res.cookie('technova_token', token, cookieOptions);
  res.status(status).json({
    success: true,
    data: { user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } }
  });
}

exports.register = async (req, res) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) throw new ApiError(400, 'fullname, email and password are required');
  if (await User.exists({ email })) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ fullname, email, password, role: 'customer' });
  res.status(201).json({
    success: true,
    data: { user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Account is locked');
  sendAuth(res, user);
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || user.role !== 'admin' || !(await user.comparePassword(password)))
    throw new ApiError(401, 'Invalid admin credentials');
  sendAuth(res, user);
};

exports.me = async (req, res) => {
  res.json({ success: true, data: { user: {
    id: req.user._id, fullname: req.user.fullname, email: req.user.email, role: req.user.role
  }}});
};

exports.logout = async (req, res) => {
  res.clearCookie('technova_token');
  res.json({ success: true });
};