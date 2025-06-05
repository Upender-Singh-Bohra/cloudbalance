import { api } from './authService';

const cloudAccountService = {
  // Create a new cloud account
  createCloudAccount: async (accountData) => {
    const response = await api.post('/accounts', accountData);
    return response.data.data;
  },

  // Get all cloud accounts
  getAllCloudAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data.data;
  },

  // Get cloud account by ID
  getCloudAccountById: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data.data;
  },

  // Get orphaned cloud accounts (not assigned to any user)
  getOrphanedCloudAccounts: async () => {
    const response = await api.get('/accounts/orphaned');
    return response.data.data;
  },

  // Enable or disable a cloud account
  setCloudAccountActiveStatus: async (id, isActive) => {
    const response = await api.put(`/accounts/${id}/status?active=${isActive}`);
    return response.data.data;
  },

  getAccessibleAccountsForUser: async (userId) => {
    const response = await api.get(`/accounts/user/${userId}/accessible`);
    return response.data.data;
  }
};
  

export default cloudAccountService;