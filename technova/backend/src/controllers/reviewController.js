const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/apiError');

exports.create = async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, 'Đánh giá phải từ 1 đến 5 sao');
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  const purchased = await Order.exists({ user: req.user._id, status: 'completed', 'items.product': product._id });
  if (!purchased) throw new ApiError(403, 'Bạn cần mua và nhận sản phẩm trước khi đánh giá');
  const existing = await Review.findOne({ product: product._id, user: req.user._id });
  if (existing) throw new ApiError(409, 'Bạn đã đánh giá sản phẩm này');
  const review = await Review.create({ product: product._id, user: req.user._id, rating, comment: String(req.body.comment || '').trim() });
  const stats = await Review.aggregate([{ $match: { product: product._id } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await Product.updateOne({ _id: product._id }, { rating: Number((stats[0]?.avg || 0).toFixed(1)), reviewCount: stats[0]?.count || 0 });
  const populated = await review.populate('user', 'fullname');
  res.status(201).json({ success: true, data: populated });
};
