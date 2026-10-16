const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/token');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function publicUser(user) {
  return { id: user._id, fullname: user.fullname, email: user.email, role: user.role, phone: user.phone, address: user.address };
}

function sendAuth(res, user, status = 200) {
  const token = signToken({ id: user._id.toString(), role: user.role });
  res.cookie('technova_token', token, cookieOptions);
  res.status(status).json({ success: true, data: { user: publicUser(user) } });
}

exports.register = async (req, res) => {
  const fullname = String(req.body.fullname || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (fullname.length < 2 || !email || password.length < 6) throw new ApiError(400, 'Họ tên, email hợp lệ và mật khẩu tối thiểu 6 ký tự là bắt buộc');
  if (await User.exists({ email })) throw new ApiError(409, 'Email đã được đăng ký');
  const user = await User.create({ fullname, email, password, role: 'customer' });
  res.status(201).json({ success: true, data: { user: publicUser(user) } });
};

exports.login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
  if (!user.isActive) throw new ApiError(403, 'Tài khoản đang bị khóa');
  sendAuth(res, user);
};

exports.me = async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
};

exports.updateProfile = async (req, res) => {
  const allowed = ['fullname', 'phone', 'address'];
  for (const key of allowed) if (req.body[key] !== undefined) req.user[key] = String(req.body[key]).trim();
  await req.user.save();
  res.json({ success: true, data: { user: publicUser(req.user) } });
};

exports.logout = async (req, res) => {
  res.clearCookie('technova_token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true });
};
