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
  const [transactions, setTransactions]   = useState([]);
  const [categories, setCategories]       = useState([]);
  const [analytics, setAnalytics]         = useState({
    totals: { income: 0, expense: 0, balance: 0 },
    categoryBreakdown: [],
    monthlyReport: [],
    insights: {},
  });
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(1);
  const [pages, setPages]                 = useState(1);
  const [customCategory, setCustomCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [exporting, setExporting]         = useState(false);

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
      setCategoryError('Category name is required.');
      return;
    }
    try {
      await createCategory({ name: customCategory });
      setCustomCategory('');
      refreshDashboard();
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to add category.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account and all data permanently?')) return;
    try {
      await deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportTransactionsCsv();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  const totalExpense = analytics.totals.expense || 0;
  const totalIncome  = analytics.totals.income  || 0;
  const balance      = analytics.totals.balance  || 0;
  const expenseChange = analytics.insights.expenseChangePercent;

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="dashboard-page">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="dashboard-navbar navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-dot" />
          <div>
            <h1>FinTrack</h1>
            <p className="navbar-subtitle">Personal finance dashboard</p>
          </div>
        </div>

        <div className="navbar-actions">
          <button
            className="btn btn-ghost btn-small"
            onClick={handleExport}
            disabled={exporting}
            title="Export transactions as CSV"
          >
            {exporting ? (
              <>
                <span className="auth-spinner" style={{ borderTopColor: 'currentColor', width: 12, height: 12 }} aria-hidden="true" />
                Exporting…
              </>
            ) : (
              <>
                {/* download icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </>
            )}
          </button>

          <button
            className="btn btn-ghost btn-small"
            onClick={onToggleTheme}
            title="Toggle colour theme"
          >
            {darkMode ? (
              /* sun icon */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* moon icon */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>

          <button className="btn btn-ghost btn-small" onClick={onLogout}>
            {/* logout icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>

          {/* Avatar */}
          <div className="navbar-avatar" title={user.name}>{initials}</div>
        </div>
      </nav>

      <div className="dashboard-content">

        {/* ── Summary Cards ───────────────────────────────────── */}
        <section className="summary-panel">
          <div className="summary-card income">
            <div className="summary-card-icon income">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span>Total Income</span>
            <strong>${totalIncome.toFixed(2)}</strong>
          </div>

          <div className="summary-card expense">
            <div className="summary-card-icon expense">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <span>Total Expenses</span>
            <strong>${totalExpense.toFixed(2)}</strong>
          </div>

          <div className="summary-card balance">
            <div className="summary-card-icon balance">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <span>Net Balance</span>
            <strong>${balance.toFixed(2)}</strong>
          </div>

          <div className="summary-card insight">
            <div className="summary-card-icon insight">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span>Top Category</span>
            <strong>{analytics.insights.highestExpenseCategory || 'None'}</strong>
            {expenseChange !== undefined && (
              <span className={`chip ${expenseChange >= 0 ? 'chip-danger' : 'chip-success'}`}
                style={{ alignSelf: 'flex-start' }}>
                {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange)}% vs last month
              </span>
            )}
          </div>
        </section>

        {/* ── Main Split ──────────────────────────────────────── */}
        <div className="split-panel">

          {/* Left column — Transaction form + list */}
          <div className="left-panel">

            {/* Add Transaction */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Add Transaction</span>
              </div>
              <div className="panel-body">
                <TransactionForm categories={categories} onAdd={handleAddTransaction} />
              </div>
            </div>

            {/* Transaction List */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Recent Transactions</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Page {page} of {pages}
                </span>
              </div>
              <TransactionList transactions={transactions} onDelete={handleDelete} />

              {pages > 1 && (
                <div className="pagination-controls">
                  <span>{transactions.length} transactions shown</span>
                  <div className="page-btns">
                    <button
                      className="page-btn"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page <= 1}
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-btn${page === p ? ' active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      onClick={() => setPage((p) => Math.min(p + 1, pages))}
                      disabled={page >= pages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right column — Category manager only */}
          <div className="right-panel">

            {/* Category Manager */}
            <div className="panel category-manager">
              <div className="panel-header">
                <span className="panel-title">Categories</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {categories.length} active
                </span>
              </div>
              <div className="panel-body">
                {categoryError && (
                  <div className="error-msg" role="alert" style={{ marginBottom: 12 }}>
                    {categoryError}
                  </div>
                )}
                <form className="category-form" onSubmit={handleAddCategory}>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="New category name"
                  />
                  <button className="btn btn-secondary btn-small" type="submit">
                    Add
                  </button>
                </form>

                <div className="category-badges" style={{ marginTop: 14 }}>
                  {categories.map((cat) => (
                    <span key={cat.id || cat._id} className="category-badge">
                      <span
                        className="category-badge-dot"
                        style={{ background: 'var(--accent)' }}
                      />
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Analytics — full width below split ──────────────── */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Analytics</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Category breakdown &amp; monthly trends
            </span>
          </div>
          <div className="panel-body">
            <AnalyticsCharts
              categoryBreakdown={analytics.categoryBreakdown}
              monthlyReport={analytics.monthlyReport}
            />
          </div>
        </div>

        {/* ── Delete Account ──────────────────────────────────── */}
        <div className="delete-account-footer">
          <button className="btn delete-account btn-small" onClick={handleDeleteAccount}>
            Delete my account
          </button>
        </div>

      </div>

      {/* ── Loading Overlay ─────────────────────────────────── */}
      {loading && (
        <div className="loading-overlay" role="status" aria-label="Loading dashboard">
          <div className="loading-spinner" />
        </div>
      )}

    </div>
  );
}

export default Dashboard;
