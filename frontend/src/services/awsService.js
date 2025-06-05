// src/services/awsService.js
import { api } from './authService';

const awsService = {
  // Get all cloud accounts
  getAllCloudAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data.data;
  },
  
  // Get EC2 instances for an account
  getEC2Instances: async (accountId) => {
    const response = await api.get(`/api/aws-services/ec2/${accountId}`);
    return response.data.data;
  },
  
  // Get RDS instances for an account
  getRDSInstances: async (accountId) => {
    const response = await api.get(`/api/aws-services/rds/${accountId}`);
    return response.data.data;
  },
  
  // Get Auto Scaling Groups for an account
  getAutoScalingGroups: async (accountId) => {
    const response = await api.get(`/api/aws-services/asg/${accountId}`);
    return response.data.data;
  }
};

export default awsService;