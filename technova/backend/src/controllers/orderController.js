const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/apiError');

const SHIPPING_THRESHOLD = 1000000;
const SHIPPING_FEE = 30000;
const COUPONS = { TECH10: 0.10, TECH5: 0.05 };

function calculateTotals(subtotal, couponCode) {
  const code = String(couponCode || '').trim().toUpperCase();
  const discount = COUPONS[code] ? Math.round(subtotal * COUPONS[code]) : 0;
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { discount, shippingFee, couponCode: discount ? code : '', total: Math.max(0, subtotal + shippingFee - discount) };
}

exports.quote = async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) throw new ApiError(400, 'Giỏ hàng trống');
  let subtotal = 0;
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError(400, 'Số lượng không hợp lệ');
    const p = await Product.findOne({ _id: item.product, isActive: true });
    if (!p) throw new ApiError(400, 'Sản phẩm không còn bán');
    if (p.stock < quantity) throw new ApiError(400, `Không đủ tồn kho: ${p.name}`);
    subtotal += (p.salePrice ?? p.price) * quantity;
  }
  res.json({ success: true, data: { subtotal, ...calculateTotals(subtotal, req.body.couponCode) } });
};

exports.create = async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod', couponCode = '' } = req.body;
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, 'Giỏ hàng trống');
  if (!shippingAddress?.fullname || !shippingAddress?.phone || !shippingAddress?.address) throw new ApiError(400, 'Thông tin giao hàng là bắt buộc');
  if (!['cod', 'bank'].includes(paymentMethod)) throw new ApiError(400, 'Phương thức thanh toán không hợp lệ');

  const orderItems = [];
  let subtotal = 0;
  const reserved = [];
  try {
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError(400, 'Số lượng không hợp lệ');
      const p = await Product.findOne({ _id: item.product, isActive: true });
      if (!p) throw new ApiError(400, 'Một sản phẩm không còn bán');
      const updated = await Product.findOneAndUpdate({ _id: p._id, isActive: true, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!updated) throw new ApiError(409, `Không đủ tồn kho: ${p.name}`);
      reserved.push({ id: p._id, quantity });
      const price = p.salePrice ?? p.price;
      orderItems.push({ product: p._id, name: p.name, image: p.image, price, quantity });
      subtotal += price * quantity;
    }
    const totals = calculateTotals(subtotal, couponCode);
    const order = await Order.create({ user: req.user._id, items: orderItems, subtotal, ...totals, shippingAddress, paymentMethod });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (reserved.length) await Promise.all(reserved.map(r => Product.updateOne({ _id: r.id }, { $inc: { stock: r.quantity } })));
    throw error;
  }
};

exports.myOrders = async (req, res) => res.json({ success: true, data: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) });

exports.getMy = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  res.json({ success: true, data: order });
};

exports.adminList = async (req, res) => res.json({ success: true, data: await Order.find().populate('user', 'fullname email phone address').sort({ createdAt: -1 }) });

exports.adminGet = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'fullname email phone address');
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  res.json({ success: true, data: order });
};

exports.updateStatus = async (req, res) => {
  const allowed = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, 'Trạng thái không hợp lệ');
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  if (order.status === 'completed' && req.body.status !== 'completed') throw new ApiError(400, 'Đơn đã hoàn tất không thể đổi trạng thái');
  if (req.body.status === 'cancelled' && order.status !== 'cancelled') {
    await Promise.all(order.items.map(i => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
  }
  order.status = req.body.status;
  await order.save();
  res.json({ success: true, data: order });
};

exports.cancelMy = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(400, 'Đơn hàng đã được xử lý, không thể hủy');
  order.status = 'cancelled';
  await order.save();
  await Promise.all(order.items.map(i => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
  res.json({ success: true, data: order });
};
