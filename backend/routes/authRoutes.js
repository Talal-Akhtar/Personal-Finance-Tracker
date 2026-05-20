// routes/authRoutes.js — Defines auth API endpoints

const express = require('express');
const router = express.Router();
const { register, login, verify, deleteAccount } = require('../authController');
const { protect } = require('../authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', protect, verify);

// DELETE /api/auth/delete
router.delete('/delete', protect, deleteAccount);

module.exports = router;
