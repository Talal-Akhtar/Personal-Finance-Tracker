// Handles transaction CRUD logic

const Transaction = require('./Transaction');

const buildTransactionMatch = (query, userId) => {
  const match = { user: userId };

  if (query.type) {
    match.type = query.type;
  }

  if (query.category) {
    match.category = query.category;
  }

  if (query.startDate || query.endDate) {
    match.createdAt = {};
    if (query.startDate) {
      match.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  return match;
};

const getTransactions = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const match = buildTransactionMatch(req.query, req.user._id);

    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(match),
      Transaction.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const addTransaction = async (req, res, next) => {
  const { title, amount, type, category } = req.body;

  try {
    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category: category?.trim() || 'General',
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

const exportTransactions = async (req, res, next) => {
  try {
    const match = buildTransactionMatch(req.query, req.user._id);
    const transactions = await Transaction.find(match).sort({ createdAt: -1 });

    const header = ['Title', 'Amount', 'Type', 'Category', 'Date'];
    const rows = transactions.map((transaction) => [
      transaction.title,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.createdAt.toISOString(),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, addTransaction, deleteTransaction, exportTransactions };
