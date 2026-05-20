// src/App.jsx — Root component, handles which page to show

import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { verifyUser } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');

    if (!token || !saved) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const [page, setPage] = useState('login');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!user) {
        setInitializing(false);
        return;
      }

      try {
        const res = await verifyUser();
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setPage('login');
      } finally {
        setInitializing(false);
      }
    };

    verifySession();
  }, [user]);

  useEffect(() => {
    document.body.className = darkMode ? 'theme-dark' : 'theme-light';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('login');
  };

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  if (initializing) {
    return null;
  }

  // ─── Render ────────────────────────────────────────────────────
  // If user is logged in, show Dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} darkMode={darkMode} onToggleTheme={handleToggleTheme} />;
  }

  // Otherwise show Login or Register
  if (page === 'register') {
    return (
      <Register
        onLogin={handleLogin}
        goToLogin={() => setPage('login')}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      goToRegister={() => setPage('register')}
    />
  );
}

export default App;
