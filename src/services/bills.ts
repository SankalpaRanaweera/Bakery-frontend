import api from './api';

export interface Bill {
  id: number;
  customer_id: number;
  date: string;
  total_amount: number;
  payment_status: 'OK' | 'N/A' | 'Partial';
  paid_amount: number;
  outstanding_balance: number;
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
}

export const billsService = {
  async getAll(params?: { payment_status?: string }) {
    const response = await api.get('/bills', { params });
    return response.data;
  },

  async generateBill(data: { customer_id: number; date: string }) {
    const response = await api.post('/bills/generate', data);
    return response.data;
  },

  async getOne(id: number) {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  async updatePayment(id: number, paid_amount: number) {
    const response = await api.put(`/bills/${id}/payment`, { paid_amount });
    return response.data;
  },

  async getPrintData(id: number) {
    const response = await api.get(`/bills/${id}/print`);
    return response.data;
  }
};