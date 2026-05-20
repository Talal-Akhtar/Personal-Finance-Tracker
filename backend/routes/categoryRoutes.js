// routes/categoryRoutes.js — Category management APIs

const express = require('express');
const { body } = require('express-validator');
const { getCategories, addCategory } = require('../categoryController');
const { protect } = require('../authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', protect, getCategories);
router.post(
  '/',
  protect,
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validateRequest,
  addCategory
);

module.exports = router;
