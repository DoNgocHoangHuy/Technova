const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/apiError');
const slugify = require('slugify');

exports.list = async (req, res) => {
  const { search = '', category, sort = 'newest' } = req.query;
  const filter = { isActive: true };
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { brand: new RegExp(search, 'i') }
  ];
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (!cat) return res.json({ success: true, data: [] });
    filter.category = cat._id;
  }
  const sortMap = { priceAsc: { price: 1 }, priceDesc: { price: -1 }, newest: { createdAt: -1 } };
  const products = await Product.find(filter).populate('category').sort(sortMap[sort] || sortMap.newest);
  res.json({ success: true, data: products });
};

exports.get = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: product });
};

exports.create = async (req, res) => {
  const body = req.body;
  if (!body.name || body.price == null || !body.category) throw new ApiError(400, 'name, price and category are required');
  const product = await Product.create({ ...body, slug: slugify(body.name, { lower: true, strict: true }) + '-' + Date.now() });
  res.status(201).json({ success: true, data: product });
};

exports.update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: product });
};

exports.remove = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: product });
};