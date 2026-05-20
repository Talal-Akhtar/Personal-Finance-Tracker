// src/components/TransactionList.jsx — Displays all transactions

import { deleteTransaction } from '../api';

function TransactionList({ transactions, onDelete }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      onDelete(id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="transaction-list">
      <h3>📋 Transactions</h3>

      {transactions.length === 0 ? (
        <div className="empty-state">No transactions yet. Add one above!</div>
      ) : (
        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.category}</td>
                  <td className={transaction.type}>{transaction.type}</td>
                  <td>${transaction.amount.toFixed(2)}</td>
                  <td>{formatDate(transaction.createdAt)}</td>
                  <td>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(transaction._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
