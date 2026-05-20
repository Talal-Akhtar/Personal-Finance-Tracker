import { useState } from 'react';
import { registerUser } from '../api';

function Register({ onLogin, goToLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-dot" />
          <span className="auth-brand-name">FinTrack</span>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start tracking your finances in seconds</p>

        {/* Error */}
        {error && (
          <div className="error-msg" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Centered register button */}
          <div className="auth-btn-wrap">
            <button
              className="btn btn-primary auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        {/* Footer link */}
        <p className="auth-footer">
          Already have an account?{' '}
          <a onClick={goToLogin} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goToLogin()}>
            Sign in
          </a>
        </p>

      </div>
    </div>
  );
}

export default Register;
