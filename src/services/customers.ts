// src/services/customers.ts - COMPLETE FULL CODE

import api from './api';

export interface Customer {
  id: number;
  salesperson_id: number;
  name: string;
  phone: string | null;
  address: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  salesperson?: {
    id: number;
    name: string;
    vehicle_number: string;
    phone: string;
  };
}

export const customersService = {
  /**
   * Get all customers
   * @param salespersonId - Optional: Filter by salesperson
   */
  async getAll(salespersonId?: number) {
    const params = salespersonId ? { salesperson_id: salespersonId } : {};
    const response = await api.get('/customers', { params });
    return response.data;
  },

  /**
   * Get single customer by ID
   * @param id - Customer ID
   */
  async getOne(id: number) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  /**
   * Create new customer
   * @param data - Customer data
   */
  async create(data: Partial<Customer>) {
    const response = await api.post('/customers', data);
    return response.data;
  },

  /**
   * Update existing customer
   * @param id - Customer ID
   * @param data - Updated customer data
   */
  async update(id: number, data: Partial<Customer>) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Delete customer
   * @param id - Customer ID
   */
  async delete(id: number) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};