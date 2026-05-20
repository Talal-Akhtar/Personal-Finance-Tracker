// routes/analyticsRoutes.js — Analytics and report APIs

const express = require('express');
const { getAnalytics } = require('../analyticsController');
const { protect } = require('../authMiddleware');

const router = express.Router();

router.get('/summary', protect, getAnalytics);

module.exports = router;
