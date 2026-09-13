const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

exports.stats = async (req, res) => {
  const [products, customers, orders, revenue] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'customer' }),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }])
  ]);
  res.json({ success: true, data: { products, customers, orders, revenue: revenue[0]?.total || 0 } });
};