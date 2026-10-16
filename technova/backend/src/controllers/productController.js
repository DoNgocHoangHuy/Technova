const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ApiError = require('../utils/apiError');
const slugify = require('slugify');

function validateProduct(body) {
  if (!body.name || !body.category) throw new ApiError(400, 'Tên sản phẩm và danh mục là bắt buộc');
  const price = Number(body.price);
  const stock = Number(body.stock);
  const salePrice = body.salePrice === null || body.salePrice === '' || body.salePrice === undefined ? null : Number(body.salePrice);
  if (!Number.isFinite(price) || price < 0) throw new ApiError(400, 'Giá sản phẩm không hợp lệ');
  if (!Number.isInteger(stock) || stock < 0) throw new ApiError(400, 'Tồn kho không hợp lệ');
  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > price)) throw new ApiError(400, 'Giá khuyến mãi phải từ 0 đến giá gốc');
  return { price, stock, salePrice };
}

exports.list = async (req, res) => {
  const { search = '', category, sort = 'newest', featured } = req.query;
  const filter = { isActive: true };
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: new RegExp(safe, 'i') }, { brand: new RegExp(safe, 'i') }];
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (!cat) return res.json({ success: true, data: [] });
    filter.category = cat._id;
  }
  if (featured === 'true') filter.featured = true;
  const sortMap = { priceAsc: { price: 1 }, priceDesc: { price: -1 }, newest: { createdAt: -1 }, rating: { rating: -1 } };
  const products = await Product.find(filter).populate('category').sort(sortMap[sort] || sortMap.newest);
  res.json({ success: true, data: products });
};

exports.adminList = async (req, res) => {
  const products = await Product.find().populate('category').sort({ createdAt: -1 });
  res.json({ success: true, data: products });
};

exports.get = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('category');
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  const reviews = await Review.find({ product: product._id }).populate('user', 'fullname').sort({ createdAt: -1 }).limit(20);
  const related = await Product.find({ category: product.category._id, _id: { $ne: product._id }, isActive: true }).limit(4).populate('category');
  res.json({ success: true, data: { product, reviews, related } });
};

exports.create = async (req, res) => {
  const { price, stock, salePrice } = validateProduct(req.body);
  const base = slugify(req.body.name, { lower: true, strict: true });
  const images = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : [];
  const image = req.body.image || images[0] || '';
  const product = await Product.create({ ...req.body, price, stock, salePrice, image, images, slug: `${base}-${Date.now()}` });
  res.status(201).json({ success: true, data: product });
};

exports.update = async (req, res) => {
  const current = await Product.findById(req.params.id);
  if (!current) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  const { price, stock, salePrice } = validateProduct({ ...current.toObject(), ...req.body });
  const body = { ...req.body, price, stock, salePrice };
  if (Array.isArray(body.images)) body.images = body.images.filter(Boolean);
  if (body.image === undefined && body.images?.length) body.image = body.images[0];
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).populate('category');
  res.json({ success: true, data: product });
};

exports.toggle = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  product.isActive = !product.isActive;
  await product.save();
  res.json({ success: true, data: product });
};

exports.remove = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  product.isActive = false;
  await product.save();
  res.json({ success: true, data: product });
};

exports.reviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate('user', 'fullname').sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
};
