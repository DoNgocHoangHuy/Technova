const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, min: 1 }
}, { _id: false });

module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [itemSchema], required: true },
  subtotal: Number,
  total: Number,
  shippingAddress: {
    fullname: String,
    phone: String,
    address: String
  },
  paymentMethod: { type: String, enum: ['cod', 'bank'], default: 'cod' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true }));