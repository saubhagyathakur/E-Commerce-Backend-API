const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('token') || '';
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || (data.errors && data.errors[0]?.message) || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.data.token);
    setStoredUser(res.data.user);
    return res.data;
  },

  register: async (name, email, password, role = 'customer', adminSecretKey = '') => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, adminSecretKey })
    });
    setAuthToken(res.data.token);
    setStoredUser(res.data.user);
    return res.data;
  },

  getProfile: async () => {
    const res = await request('/auth/me');
    setStoredUser(res.data.user);
    return res.data.user;
  },

  getDashboardStats: async () => {
    const res = await request('/auth/stats');
    return res.data;
  },

  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);

    const qs = query.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;
    return request(endpoint);
  },

  getCategories: async () => {
    const res = await request('/products/categories');
    return res.data || [];
  },

  createProduct: async (productData) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  updateProduct: async (id, productData) => {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Shopping Cart
  getCart: async () => {
    const res = await request('/cart');
    return res.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const res = await request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    return res.data;
  },

  updateCartQuantity: async (productId, quantity) => {
    const res = await request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return res.data;
  },

  removeFromCart: async (productId) => {
    const res = await request(`/cart/${productId}`, {
      method: 'DELETE'
    });
    return res.data;
  },

  clearCart: async () => {
    const res = await request('/cart', {
      method: 'DELETE'
    });
    return res.data;
  },

  // Orders
  placeOrder: async (shippingAddress) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress })
    });
  },

  getMyOrders: async () => {
    const res = await request('/orders/my-orders');
    return res.data || [];
  },

  getAllOrders: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    const qs = query.toString();
    const res = await request(`/orders${qs ? `?${qs}` : ''}`);
    return res.data || [];
  },

  updateOrderStatus: async (id, status) => {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
