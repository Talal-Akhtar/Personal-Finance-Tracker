// routes/transactionRoutes.js — Defines transaction API endpoints

const express = require('express');
const { body, param, query } = require('express-validator');
const { getTransactions, addTransaction, deleteTransaction, exportTransactions } = require('../transactionController');
const { protect } = require('../authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const transactionFilters = [
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('category').optional().trim().notEmpty().withMessage('Category must be a non-empty string'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest,
];

const transactionValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').optional().trim().notEmpty().withMessage('Category must be a non-empty string'),
  validateRequest,
];

const router = express.Router();

router.get('/', protect, transactionFilters, getTransactions);
router.get('/export', protect, transactionFilters, exportTransactions);
router.post('/', protect, transactionValidators, addTransaction);
router.delete('/:id', protect, param('id').isMongoId().withMessage('Transaction ID must be valid'), validateRequest, deleteTransaction);

module.exports = router;
