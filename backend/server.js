// server.js — Entry point of the app

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from frontend (React dev server runs on port 3000)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Finance Tracker API is running!' });
});

app.use(errorHandler);

// ─── Connect to MongoDB & Start Server ───────────────────────────────────────

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
