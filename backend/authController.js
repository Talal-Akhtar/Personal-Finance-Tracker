// Handles register & login logic

const User = require('./User');
const Category = require('./Category');
const Transaction = require('./Transaction');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper: generate a JWT token for a user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // token expires in 7 days
  });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY SESSION ───────────────────────────────────────────────────────────
const verify = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  res.json({ user: req.user });
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Transaction.deleteMany({ user: userId }),
      Category.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, verify, deleteAccount };
