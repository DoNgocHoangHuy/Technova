const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/apiError');

exports.create = async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body;
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, 'Cart is empty');
  if (!shippingAddress?.fullname || !shippingAddress?.phone || !shippingAddress?.address) {
    throw new ApiError(400, 'Shipping information is required');
  }

  // Intentionally no MongoDB transaction here because the local development
  // MongoDB instance is a standalone server, not a replica set.
  const orderItems = [];
  let total = 0;
  const reserved = [];

  try {
    for (const item of items) {
      const quantity = Math.max(1, Number(item.quantity) || 0);
      const p = await Product.findOne({ _id: item.product, isActive: true });
      if (!p) throw new ApiError(400, 'A product is unavailable');
      if (p.stock < quantity) throw new ApiError(400, `Not enough stock for ${p.name}`);

      // Atomic stock decrement prevents two requests from taking the same stock.
      const updated = await Product.findOneAndUpdate(
        { _id: p._id, isActive: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!updated) throw new ApiError(409, `Not enough stock for ${p.name}`);

      reserved.push({ id: p._id, quantity });
      const price = p.salePrice ?? p.price;
      orderItems.push({ product: p._id, name: p.name, image: p.image, price, quantity });
      total += price * quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal: total,
      total,
      shippingAddress,
      paymentMethod
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    // Compensate stock if order creation fails after one or more decrements.
    if (reserved.length) {
      await Promise.all(reserved.map(r => Product.updateOne({ _id: r.id }, { $inc: { stock: r.quantity } })));
    }
    throw error;
  }
};

exports.myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

exports.adminList = async (req, res) => {
  const orders = await Order.find().populate('user', 'fullname email phone').sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

exports.updateStatus = async (req, res) => {
  const allowed = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, 'Invalid status');
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
};
