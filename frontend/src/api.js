// src/api.js — All API calls live here (keeps components clean)

import axios from 'axios';

// Base URL for our backend
const BASE_URL = 'http://localhost:5000/api';

// ─── Helper: get auth headers ──────────────────────────────────────────────
// Reads the JWT from localStorage and puts it in the Authorization header
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ─── Auth ──────────────────────────────────────────────────────────────────

export const registerUser = (data) =>
  axios.post(`${BASE_URL}/auth/register`, data);

export const loginUser = (data) =>
  axios.post(`${BASE_URL}/auth/login`, data);

export const verifyUser = () =>
  axios.get(`${BASE_URL}/auth/verify`, { headers: authHeaders() });

export const deleteAccount = () =>
  axios.delete(`${BASE_URL}/auth/delete`, { headers: authHeaders() });

// ─── Transactions ──────────────────────────────────────────────────────────

export const getTransactions = (params) =>
  axios.get(`${BASE_URL}/transactions`, { headers: authHeaders(), params });

export const addTransaction = (data) =>
  axios.post(`${BASE_URL}/transactions`, data, { headers: authHeaders() });

export const deleteTransaction = (id) =>
  axios.delete(`${BASE_URL}/transactions/${id}`, { headers: authHeaders() });

export const exportTransactionsCsv = (params) =>
  axios.get(`${BASE_URL}/transactions/export`, {
    headers: authHeaders(),
    params,
    responseType: 'blob',
  });

export const fetchCategories = () =>
  axios.get(`${BASE_URL}/categories`, { headers: authHeaders() });

export const createCategory = (data) =>
  axios.post(`${BASE_URL}/categories`, data, { headers: authHeaders() });

export const fetchAnalytics = () =>
  axios.get(`${BASE_URL}/analytics/summary`, { headers: authHeaders() });
