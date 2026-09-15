export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  RENT: {
    EQUIPMENT: '/rent/equipment',
    REQUESTS: '/rent/requests',
    MY_RENTALS: '/rent/my-rentals',
    ADMIN_REQUESTS: '/rent/admin/requests',
    ADMIN_UPDATE_STATUS: (id) => `/rent/admin/requests/${id}/status`,
  },
  CONTACTS: {
    INFO: '/contacts',
    MESSAGE: '/contacts/message',
  },
}