import { api } from '../../services/authService';

const costExplorerService = {
  // Get cost data based on filters
  getCostData: async (filters) => {
    const response = await api.post('/cost-explorer/data', filters);
    return response.data;
  },

  // Get distinct values for a specific field for filter options
  getFilterValues: async (field) => {
    const response = await api.get(`/cost-explorer/filter-values/${field}`);
    return response.data;
  },

  // Get available accounts for the current user
  getAvailableAccounts: async () => {
    const response = await api.get('/cost-explorer/available-accounts');
    return response.data;
  }
};

export default costExplorerService;
