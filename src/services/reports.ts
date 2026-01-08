import api from './api';

export const reportsService = {
  async getDailySales(date?: string) {
    const response = await api.get('/reports/sales/daily', {
      params: { date }
    });
    return response.data;
  },

  async getUnpaidDebts() {
    const response = await api.get('/reports/unpaid');
    return response.data;
  }
};