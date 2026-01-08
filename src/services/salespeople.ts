import api from './api';

export interface Salesperson {
  id: number;
  vehicle_number: string;
  phone: string;
  name: string;
  is_active: boolean;
}

export const salespeopleService = {
  async getAll() {
    const response = await api.get('/salespeople');
    return response.data;
  },

  async create(data: Partial<Salesperson>) {
    const response = await api.post('/salespeople', data);
    return response.data;
  },

  async update(id: number, data: Partial<Salesperson>) {
    const response = await api.put(`/salespeople/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/salespeople/${id}`);
    return response.data;
  }
};