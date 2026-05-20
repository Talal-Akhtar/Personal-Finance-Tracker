// src/pages/Dashboard.jsx — Main page after login

import { useEffect, useState } from 'react';
import {
  getTransactions,
  fetchCategories,
  createCategory,
  fetchAnalytics,
  exportTransactionsCsv,
  deleteAccount,
} from '../api';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import AnalyticsCharts from '../components/AnalyticsCharts';

function Dashboard({ user, onLogout, darkMode, onToggleTheme }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState({
    totals: { income: 0, expense: 0, balance: 0 },
    categoryBreakdown: [],
    monthlyReport: [],
    insights: {},
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [customCategory, setCustomCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoading(true);
        const [categoriesRes, analyticsRes] = await Promise.all([
          fetchCategories(),
          fetchAnalytics(),
        ]);
        setCategories(categoriesRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMeta();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const res = await getTransactions({ page, limit: 8 });
        setTransactions(res.data.transactions);
        setPages(res.data.pages);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [page]);

  useEffect(() => {
    if (categories.length && !categories.some((item) => item.name === 'General')) {
      setCategories((prev) => [...prev, { id: 'general', name: 'General' }]);
    }
  }, [categories]);

  const refreshDashboard = async () => {
    try {
      const [categoriesRes, analyticsRes] = await Promise.all([
        fetchCategories(),
        fetchAnalytics(),
      ]);
      setCategories(categoriesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const handleAddTransaction = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
    refreshDashboard();
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    refreshDashboard();
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    setCategoryError('');

    if (!customCategory.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    try {
      await createCategory({ name: customCategory });
      setCustomCategory('');
      refreshDashboard();
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account and all data permanently?')) {
      return;
    }

    try {
      await deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportTransactionsCsv();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const totalExpense = analytics.totals.expense || 0;
  const totalIncome = analytics.totals.income || 0;
  const balance = analytics.totals.balance || 0;

  return (
    <div className="dashboard-page">
      <div className="navbar dashboard-navbar">
        <div>
          <h1>Finance Tracker</h1>
          <p className="navbar-subtitle">Analytics dashboard for your money flow</p>
        </div>

        <div className="navbar-right">
          <div className="navbar-actions">
            <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button className="btn btn-tertiary" onClick={onToggleTheme}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="btn btn-ghost" onClick={onLogout}>Logout</button>
          </div>
          <div className="navbar-user">
            <span>{user.name}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="panel summary-panel">
          <div className="summary-card income">
            <span>Total Income</span>
            <strong>${totalIncome.toFixed(2)}</strong>
          </div>
          <div className="summary-card expense">
            <span>Total Expense</span>
            <strong>${totalExpense.toFixed(2)}</strong>
          </div>
          <div className="summary-card balance">
            <span>Balance</span>
            <strong>${balance.toFixed(2)}</strong>
          </div>
          <div className="summary-card insight">
            <span>Top Category</span>
            <strong>{analytics.insights.highestExpenseCategory || 'None'}</strong>
            <p>{analytics.insights.expenseChangePercent >= 0 ? '+' : ''}{analytics.insights.expenseChangePercent}% vs last month</p>
          </div>
        </section>

        <section className="panel category-panel">
          <div className="category-form-wrapper">
            <h3>Add Category</h3>
            {categoryError && <div className="error-msg">{categoryError}</div>}
            <form className="category-form" onSubmit={handleAddCategory}>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="New category name"
              />
              <button className="btn btn-primary" type="submit">Add</button>
            </form>
          </div>
        </section>

        <section className="panel analytics-panel">
          <AnalyticsCharts
            categoryBreakdown={analytics.categoryBreakdown}
            monthlyReport={analytics.monthlyReport}
          />
        </section>

        <section className="panel transaction-panel">
          <TransactionForm categories={categories} onAdd={handleAddTransaction} />
          <TransactionList transactions={transactions} onDelete={handleDelete} />
          {pages > 1 && (
            <div className="pagination-controls">
              <button className="btn btn-ghost" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page <= 1}>
                Previous
              </button>
              <button className="btn btn-ghost" onClick={() => setPage((prev) => Math.min(prev + 1, pages))} disabled={page >= pages}>
                Next
              </button>
            </div>
          )}
        </section>

        <div className="delete-account-footer">
          <button className="btn btn-ghost delete-account" onClick={handleDeleteAccount}>
            Delete my account
          </button>
        </div>
      </div>

      {loading && <div className="loading-overlay">Loading dashboard…</div>}
    </div>
  );
}

export default Dashboard;
