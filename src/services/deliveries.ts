import api from './api';

export interface Delivery {
  id: number;
  customer_id: number;
  date: string;
  item_id: number;
  quantity_delivered: number;
  quantity_returned: number;
  unit_price: number;
  total_amount: number;
  customer?: {
    id: number;
    name: string;
  };
  item?: {
    id: number;
    name: string;
    price: number;
  };
}

export const deliveriesService = {
  async getAll(params?: { customer_id?: number; date?: string }) {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  async create(data: {
    customer_id: number;
    date: string;
    items: Array<{
      item_id: number;
      quantity_delivered: number;
      quantity_returned?: number;
    }>;
  }) {
    const response = await api.post('/deliveries', data);
    return response.data;
  }
};