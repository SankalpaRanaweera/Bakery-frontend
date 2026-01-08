import api from './api';

export interface BakeryItem {
  id: number;
  name: string;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
}

export const itemsService = {
  async getAll() {
    const response = await api.get('/items');
    return response.data;
  },

  async create(data: Partial<BakeryItem>) {
    const response = await api.post('/items', data);
    return response.data;
  },

  async update(id: number, data: Partial<BakeryItem>) {
    const response = await api.put(`/items/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  }
};