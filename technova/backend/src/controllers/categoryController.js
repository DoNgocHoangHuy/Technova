const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');
const ApiError = require('../utils/apiError');

exports.list = async (req, res) => res.json({ success: true, data: await Category.find().sort({ name: 1 }) });

exports.create = async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (name.length < 2) throw new ApiError(400, 'Tên danh mục không hợp lệ');
  const slug = slugify(name, { lower: true, strict: true });
  if (await Category.exists({ $or: [{ name }, { slug }] })) throw new ApiError(409, 'Danh mục đã tồn tại');
  const category = await Category.create({ name, slug, image: String(req.body.image || '') });
  res.status(201).json({ success: true, data: category });
};

exports.update = async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) throw new ApiError(400, 'Tên danh mục không hợp lệ');
  const category = await Category.findByIdAndUpdate(req.params.id, { name, slug: slugify(name, { lower: true, strict: true }), image: String(req.body.image || '') }, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
  res.json({ success: true, data: category });
};

exports.remove = async (req, res) => {
  const count = await Product.countDocuments({ category: req.params.id });
  if (count) throw new ApiError(400, 'Không thể xóa danh mục đang có sản phẩm');
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
  res.json({ success: true });
};
