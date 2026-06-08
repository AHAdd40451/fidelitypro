// Mock async services - replace with real API calls later

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email, password, role) => { await delay(); return { token: 'mock-jwt-token', user: { email, role, name: role === 'merchant' ? 'Pierre Martin' : 'Admin' } }; },
  signup: async (data) => { await delay(800); return { success: true, user: { ...data, id: 'new-merchant' } }; },
  forgotPassword: async (email) => { await delay(); return { success: true }; },
  resetPassword: async (password) => { await delay(); return { success: true }; },
  verifyOtp: async (code) => { await delay(); return { success: true }; },
  logout: async () => { await delay(200); return { success: true }; },
};

export const merchantService = {
  getAll: async () => { await delay(); const { mockMerchants } = await import('@/data/mockData'); return mockMerchants; },
  getById: async (id) => { await delay(); const { mockMerchants } = await import('@/data/mockData'); return mockMerchants.find(m => m.id === id); },
  getBySlug: async (slug) => { await delay(); const { mockMerchants } = await import('@/data/mockData'); return mockMerchants.find(m => m.slug === slug); },
  create: async (data) => { await delay(800); return { success: true, id: 'new-' + Date.now() }; },
  update: async (id, data) => { await delay(); return { success: true }; },
  suspend: async (id) => { await delay(); return { success: true }; },
  delete: async (id) => { await delay(); return { success: true }; },
};

export const customerService = {
  getAll: async (merchantId) => { await delay(); const { mockCustomers } = await import('@/data/mockData'); return merchantId ? mockCustomers.filter(c => c.merchantId === merchantId) : mockCustomers; },
  getById: async (id) => { await delay(); const { mockCustomers } = await import('@/data/mockData'); return mockCustomers.find(c => c.id === id); },
  register: async (data) => { await delay(800); return { success: true, customerId: 'new-c-' + Date.now() }; },
  update: async (id, data) => { await delay(); return { success: true }; },
  delete: async (id) => { await delay(); return { success: true }; },
  addPoints: async (customerId, points) => { await delay(); return { success: true, newBalance: 500 }; },
};

export const passkitService = {
  createCard: async (merchantId, customerId) => { await delay(1000); return { success: true, cardId: 'pk-card-' + Date.now(), serialNumber: 'APL-' + Date.now() }; },
  updateCard: async (cardId, data) => { await delay(800); return { success: true }; },
  pushDesignUpdate: async (merchantId) => { await delay(1200); return { success: true, cardsUpdated: 210 }; },
  sendNotification: async (merchantId, message) => { await delay(1000); return { success: true, sent: 234 }; },
  syncTemplate: async (templateId) => { await delay(800); return { success: true }; },
  testConnection: async () => { await delay(600); return { connected: true, environment: 'sandbox' }; },
};

export const notificationService = {
  send: async (data) => { await delay(800); return { success: true, sent: data.target === 'all' ? 234 : 18 }; },
  getHistory: async (merchantId) => { await delay(); const { mockNotifications } = await import('@/data/mockData'); return merchantId ? mockNotifications.filter(n => n.merchantId === merchantId) : mockNotifications; },
};