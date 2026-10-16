const Product = require('../models/Product');
const ApiError = require('../utils/apiError');

exports.list = async (req, res) => {
  await req.user.populate('wishlist');
  res.json({ success: true, data: req.user.wishlist.filter(p => p && p.isActive) });
};

exports.toggle = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  const index = req.user.wishlist.findIndex(id => id.toString() === product._id.toString());
  if (index >= 0) req.user.wishlist.splice(index, 1);
  else req.user.wishlist.push(product._id);
  await req.user.save();
  res.json({ success: true, data: { wished: index < 0 } });
};
