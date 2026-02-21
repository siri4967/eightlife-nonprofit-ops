import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = {
  // Inventory
  getInventory: () => axios.get(`${API}/inventory`),
  createInventory: (data) => axios.post(`${API}/inventory`, data),
  updateInventory: (id, data) => axios.put(`${API}/inventory/${id}`, data),
  deleteInventory: (id) => axios.delete(`${API}/inventory/${id}`),

  // Distributions
  getDistributions: () => axios.get(`${API}/distributions`),
  createDistribution: (data) => axios.post(`${API}/distributions`, data),

  // Food Requests
  getFoodRequests: () => axios.get(`${API}/requests`),
  createFoodRequest: (data) => axios.post(`${API}/requests`, data),
  updateFoodRequest: (id, data) => axios.put(`${API}/requests/${id}`, data),

  // Alerts
  getAlerts: () => axios.get(`${API}/alerts`),
  createAlert: (data) => axios.post(`${API}/alerts`, data),
  resolveAlert: (id) => axios.put(`${API}/alerts/${id}/resolve`),

  // Analytics
  getDashboardStats: () => axios.get(`${API}/analytics/dashboard`),
  getForecast: () => axios.get(`${API}/analytics/forecast`),
  getDonorImpact: () => axios.get(`${API}/reports/donor-impact`),

  // Logistics
  getLogisticsPlanning: () => axios.get(`${API}/logistics/planning`),

  // Events
  getNextEvent: () => axios.get(`${API}/events/next`),

  // Notifications
  sendSMS: () => axios.post(`${API}/notifications/sms`),
};
