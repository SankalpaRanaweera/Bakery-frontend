import React, { useState, useEffect } from 'react';
import { deliveriesService, Delivery } from '../services/deliveries';
import { customersService, Customer } from '../services/customers';
import { itemsService, BakeryItem } from '../services/items';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [deliveryItems, setDeliveryItems] = useState<Array<{
    item_id: number;
    quantity_delivered: number;
    quantity_returned: number;
  }>>([]);

  useEffect(() => {
    fetchDeliveries();
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveriesService.getAll();
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersService.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemsService.getAll();
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch items');
    }
  };

  const addItem = () => {
    setDeliveryItems([...deliveryItems, { item_id: 0, quantity_delivered: 0, quantity_returned: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...deliveryItems];
    updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    setDeliveryItems(updated);
  };

  const removeItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }

    if (deliveryItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      await deliveriesService.create({
        customer_id: parseInt(formData.customer_id),
        date: formData.date,
        items: deliveryItems,
      });

      toast.success('Delivery recorded successfully!');
      setShowModal(false);
      setFormData({ customer_id: '', date: new Date().toISOString().split('T')[0] });
      setDeliveryItems([]);
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to record delivery');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Deliveries Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          🚚 Record Delivery
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600 mb-2">Total Deliveries</p>
          <p className="text-3xl font-bold text-blue-600">{deliveries.length}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600 mb-2">Today's Deliveries</p>
          <p className="text-3xl font-bold text-green-600">
            {deliveries.filter(d => d.date === new Date().toISOString().split('T')[0]).length}
          </p>
        </div>
        <div className="card bg-amber-50">
          <p className="text-sm text-gray-600 mb-2">Total Value</p>
          <p className="text-3xl font-bold text-amber-600">
            Rs. {deliveries.reduce((sum, d) => sum + d.total_amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(delivery.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {delivery.customer?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {delivery.item?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                    {delivery.quantity_delivered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    {delivery.quantity_returned}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                    Rs. {delivery.total_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {deliveries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-medium">No deliveries recorded</p>
              <p className="text-sm mt-2">Click "Record Delivery" to add your first delivery</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🚚 Record New Delivery</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Items Delivered</h3>
                {deliveryItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-5">
                      <select
                        value={item.item_id}
                        onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select item...</option>
                        {items.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Delivered"
                        value={item.quantity_delivered || ''}
                        onChange={(e) => updateItem(index, 'quantity_delivered', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Returned"
                        value={item.quantity_returned || ''}
                        onChange={(e) => updateItem(index, 'quantity_returned', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 w-full"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-secondary w-full"
                >
                  ➕ Add Item
                </button>
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
                  💾 Record Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;