import api from './api';

export interface Assignment {
  id: number;
  salesperson_id: number;
  date: string;
  item_id: number;
  quantity_assigned: number;
  quantity_returned: number;
  revenue: number;
  item?: {
    id: number;
    name: string;
    price: number;
  };
  salesperson?: {
    id: number;
    name: string;
    vehicle_number: string;
  };
}

export const assignmentsService = {
  async getAll(params?: { salesperson_id?: number; date?: string }) {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  async create(data: {
    salesperson_id: number;
    date: string;
    items: Array<{ item_id: number; quantity_assigned: number }>;
  }) {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  async update(id: number, data: { quantity_returned: number }) {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  async getDailyReport(salespersonId: number, date: string) {
    const response = await api.get(`/assignments/salesperson/${salespersonId}/date/${date}`);
    return response.data;
  }
};