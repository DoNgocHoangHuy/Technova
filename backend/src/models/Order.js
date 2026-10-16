const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, min: 0 },
  quantity: { type: Number, min: 1 }
}, { _id: false });

module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [itemSchema], required: true },
  subtotal: { type: Number, min: 0 },
  shippingFee: { type: Number, min: 0, default: 0 },
  discount: { type: Number, min: 0, default: 0 },
  couponCode: { type: String, default: '' },
  total: { type: Number, min: 0 },
  shippingAddress: {
    fullname: String,
    phone: String,
    city: String,
    district: String,
    ward: String,
    address: String
  },
  paymentMethod: { type: String, enum: ['cod', 'bank'], default: 'cod' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true }));
