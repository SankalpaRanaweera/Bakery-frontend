import React, { useEffect, useState } from 'react';
import { salespeopleService, Salesperson } from '../services/salespeople';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Salespeople: React.FC = () => {
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    phone: '',
    name: '',
  });

  useEffect(() => {
    fetchSalespeople();
  }, []);

  const fetchSalespeople = async () => {
    try {
      setLoading(true);
      const data = await salespeopleService.getAll();
      setSalespeople(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch salespeople');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await salespeopleService.update(editingId, formData);
        toast.success('Salesperson updated!');
      } else {
        await salespeopleService.create(formData);
        toast.success('Salesperson created!');
      }
      setShowModal(false);
      setFormData({ vehicle_number: '', phone: '', name: '' });
      setEditingId(null);
      fetchSalespeople();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      try {
        await salespeopleService.delete(id);
        toast.success('Deleted successfully');
        fetchSalespeople();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openModal = (salesperson?: Salesperson) => {
    if (salesperson) {
      setEditingId(salesperson.id);
      setFormData({
        vehicle_number: salesperson.vehicle_number,
        phone: salesperson.phone,
        name: salesperson.name,
      });
    } else {
      setEditingId(null);
      setFormData({ vehicle_number: '', phone: '', name: '' });
    }
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Salespeople Management</h1>
        <button onClick={() => openModal()} className="btn-primary">
          ➕ Add Salesperson
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salespeople.map((sp) => (
                <tr key={sp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">🚚 {sp.vehicle_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{sp.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{sp.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sp.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button onClick={() => openModal(sp)} className="text-amber-600 hover:text-amber-900 mr-4">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(sp.id)} className="text-red-600 hover:text-red-900">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Salesperson' : 'Add New Salesperson'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number *</label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  className="input-field"
                  placeholder="ABC-1234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+94 77 123 4567"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salespeople;