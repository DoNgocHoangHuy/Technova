const Category = require('../models/Category');
const slugify = require('slugify');

exports.list = async (req, res) => {
  res.json({ success: true, data: await Category.find().sort({ name: 1 }) });
};

exports.create = async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name, { lower: true, strict: true })
  });
  res.status(201).json({ success: true, data: category });
};

exports.remove = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};