import React, { useEffect, useState } from 'react';
import { itemsService, BakeryItem } from '../services/items';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Items: React.FC = () => {
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock_quantity: '0',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemsService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      };
      
      if (editingId) {
        await itemsService.update(editingId, data);
        toast.success('Item updated!');
      } else {
        await itemsService.create(data);
        toast.success('Item created!');
      }
      setShowModal(false);
      setFormData({ name: '', price: '', category: '', stock_quantity: '0' });
      setEditingId(null);
      fetchItems();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      try {
        await itemsService.delete(id);
        toast.success('Deleted successfully');
        fetchItems();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openModal = (item?: BakeryItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        category: item.category || '',
        stock_quantity: item.stock_quantity.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', category: '', stock_quantity: '0' });
    }
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Bakery Items</h1>
        <button onClick={() => openModal()} className="btn-primary">
          ➕ Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">🥖</div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
            <div className="space-y-2 text-gray-600">
              <p>Price: <span className="font-semibold text-amber-600">Rs. {item.price}</span></p>
              <p>Category: <span className="font-medium">{item.category || 'N/A'}</span></p>
              <p>Stock: <span className="font-medium">{item.stock_quantity}</span></p>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button onClick={() => openModal(item)} className="flex-1 btn-secondary text-sm">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-lg text-sm">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="White Bread"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="120.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="Bread"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="input-field"
                  placeholder="100"
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

export default Items;