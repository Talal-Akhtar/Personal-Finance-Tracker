// categoryController.js — Manage predefined and custom expense categories

const Category = require('./Category');

const DEFAULT_CATEGORIES = [
  'Food',
  'Travel',
  'Salary',
  'Shopping',
  'Housing',
  'Health',
  'Entertainment',
  'Utilities',
  'Education',
  'General',
];

const ensureDefaultCategories = async () => {
  for (const name of DEFAULT_CATEGORIES) {
    const existing = await Category.findOne({ name, user: null });
    if (!existing) {
      await Category.create({ name, user: null });
    }
  }
};

const getCategories = async (req, res, next) => {
  try {
    await ensureDefaultCategories();

    const categories = await Category.find({
      $or: [{ user: req.user._id }, { user: null }],
    }).sort('name');

    res.json(categories.map((category) => ({ id: category._id, name: category.name })));
  } catch (error) {
    next(error);
  }
};

const addCategory = async (req, res, next) => {
  const name = req.body.name.trim();

  try {
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [{ user: req.user._id }, { user: null }],
    });

    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, user: req.user._id });
    res.status(201).json({ id: category._id, name: category.name });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, addCategory };
