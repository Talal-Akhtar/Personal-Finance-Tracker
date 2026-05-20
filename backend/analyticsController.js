// analyticsController.js — Aggregated reporting and insights for the dashboard

const Transaction = require('./Transaction');

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const typeTotals = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const totals = { income: 0, expense: 0, balance: 0 };
    typeTotals.forEach((item) => {
      if (item._id === 'income') totals.income = item.total;
      if (item._id === 'expense') totals.expense = item.total;
    });
    totals.balance = totals.income - totals.expense;

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    const monthlyGroups = await Transaction.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type',
          amount: '$amount',
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 },
      },
    ]);

    const monthlyReportMap = {};
    monthlyGroups.forEach(({ _id, total }) => {
      const key = `${_id.year}-${_id.month}`;
      if (!monthlyReportMap[key]) {
        monthlyReportMap[key] = {
          year: _id.year,
          month: _id.month,
          income: 0,
          expense: 0,
          savings: 0,
        };
      }

      if (_id.type === 'income') {
        monthlyReportMap[key].income = total;
      } else {
        monthlyReportMap[key].expense = total;
      }
      monthlyReportMap[key].savings = monthlyReportMap[key].income - monthlyReportMap[key].expense;
    });

    const monthlyReport = Object.values(monthlyReportMap)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        label: `${item.month}/${item.year}`,
      }))
      .reverse();

    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const comparisonAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: previousStart,
            $lte: now,
          },
        },
      },
      {
        $project: {
          period: {
            $cond: [{ $gte: ['$createdAt', currentStart] }, 'current', 'previous'],
          },
          type: '$type',
          amount: '$amount',
        },
      },
      {
        $group: {
          _id: { period: '$period', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const periodTotals = {
      current: { income: 0, expense: 0 },
      previous: { income: 0, expense: 0 },
    };

    comparisonAgg.forEach((item) => {
      const { period, type } = item._id;
      if (type === 'income') periodTotals[period].income = item.total;
      if (type === 'expense') periodTotals[period].expense = item.total;
    });

    const expenseChangePercent = periodTotals.previous.expense === 0
      ? periodTotals.current.expense === 0
        ? 0
        : 100
      : ((periodTotals.current.expense - periodTotals.previous.expense)
          / periodTotals.previous.expense) * 100;

    const insights = {
      currentMonthExpense: periodTotals.current.expense,
      previousMonthExpense: periodTotals.previous.expense,
      expenseChangePercent: Number(expenseChangePercent.toFixed(2)),
      highestExpenseCategory: categoryBreakdown[0]?._id || 'None',
      topCategoryAmount: categoryBreakdown[0]?.total || 0,
    };

    res.json({
      totals,
      categoryBreakdown,
      monthlyReport,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
