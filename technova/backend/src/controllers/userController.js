const User = require('../models/User');
const ApiError = require('../utils/apiError');

exports.list = async (req, res) => {
  const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
};

exports.toggle = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!user) throw new ApiError(404, 'Customer not found');
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user });
};