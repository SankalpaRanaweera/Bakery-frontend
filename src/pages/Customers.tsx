// src/pages/Customers.tsx - COMPLETE FULL CODE
import React, { useEffect, useState } from 'react';
import { customersService, Customer } from '../services/customers';
import { salespeopleService, Salesperson } from '../services/salespeople';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterSalesperson, setFilterSalesperson] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    salesperson_id: '',
    name: '',
    phone: '',
    address: '',
    location: '',
  });

  useEffect(() => {
    fetchSalespeople();
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [filterSalesperson]);

  const fetchSalespeople = async () => {
    try {
      const response = await salespeopleService.getAll();
      setSalespeople(response.data);
    } catch (error) {
      toast.error('Failed to fetch salespeople');
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersService.getAll(filterSalesperson || undefined);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.salesperson_id) {
      toast.error('Please select a salesperson');
      return;
    }

    try {
      const data = {
        ...formData,
        salesperson_id: parseInt(formData.salesperson_id),
      };

      if (editingId) {
        await customersService.update(editingId, data);
        toast.success('Customer updated successfully!');
      } else {
        await customersService.create(data);
        toast.success('Customer created successfully!');
      }
      
      setShowModal(false);
      setFormData({ salesperson_id: '', name: '', phone: '', address: '', location: '' });
      setEditingId(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersService.delete(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        salesperson_id: customer.salesperson_id.toString(),
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        location: customer.location || '',
      });
    } else {
      setEditingId(null);
      setFormData({ salesperson_id: '', name: '', phone: '', address: '', location: '' });
    }
    setShowModal(true);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
        <button onClick={() => openModal()} className="btn-primary">
          ➕ Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Salesperson
            </label>
            <select
              value={filterSalesperson || ''}
              onChange={(e) => setFilterSalesperson(e.target.value ? parseInt(e.target.value) : null)}
              className="input-field"
            >
              <option value="">All Salespeople</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} ({sp.vehicle_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customers
            </label>
            <input
              type="text"
              placeholder="Search by name, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600 mb-2">Total Customers</p>
          <p className="text-3xl font-bold text-blue-600">{customers.length}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600 mb-2">Active Customers</p>
          <p className="text-3xl font-bold text-green-600">
            {customers.filter(c => c.is_active).length}
          </p>
        </div>
        <div className="card bg-amber-50">
          <p className="text-sm text-gray-600 mb-2">Filtered Results</p>
          <p className="text-3xl font-bold text-amber-600">{filteredCustomers.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salesperson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🏪</span>
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.address && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {customer.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {customer.salesperson?.name}
                      </div>
                      <div className="text-gray-500">
                        🚚 {customer.salesperson?.vehicle_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {customer.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {customer.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => openModal(customer)}
                      className="text-amber-600 hover:text-amber-900 mr-4"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-medium">No customers found</p>
              <p className="text-sm mt-2">
                {searchTerm || filterSalesperson 
                  ? 'Try adjusting your filters' 
                  : 'Click "Add Customer" to create your first customer'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salesperson *
                </label>
                <select
                  value={formData.salesperson_id}
                  onChange={(e) => setFormData({ ...formData, salesperson_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a salesperson...</option>
                  {salespeople.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} - {sp.vehicle_number}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This customer will be assigned to the selected salesperson
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Shop ABC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="123 Main Street, Colombo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Area
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="Colombo 7"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;