// Central API service layer — JWT from localStorage is sent on each request.
// Local dev: Vite proxies `/api` → backend. Production: set VITE_API_BASE_URL at build time.

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')) ||
  '/api';

const BASE_URL = API_BASE_URL;
const TOKEN_KEY = 'retailflow_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Token expired or invalid — clear and redirect
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('retailflow_auth_session');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (name, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:     ()         => request('/users'),
  getProfile: ()         => request('/users/me'),
  create:     (data)     => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update:     (id, data) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete:     (id)       => request(`/users/${id}`, { method: 'DELETE' }),
};

// ── Shops (Manager only) ──────────────────────────────────────────────────────
export const shopsAPI = {
  getAll:   ()              => request('/shops'),
  create:   (name)          => request('/shops', { method: 'POST', body: JSON.stringify({ name }) }),
  delete:   (id)            => request(`/shops/${id}`, { method: 'DELETE' }),
  addOwner: (shopId, data)  => request(`/shops/${shopId}/owners`, { method: 'POST', body: JSON.stringify(data) }),
  getUsers: (shopId)        => request(`/shops/${shopId}/users`),
};


// ── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll:    ()         => request('/products'),
  getLowStock: ()       => request('/products/low-stock'),
  create:    (data)     => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update:    (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:    (id)       => request(`/products/${id}`, { method: 'DELETE' }),
};

// ── Sales ─────────────────────────────────────────────────────────────────────
export const salesAPI = {
  getAll:  ()                   => request('/sales'),
  create:  (items, sessionId)   => request('/sales', { method: 'POST', body: JSON.stringify({ items, sessionId }) }),
};

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
