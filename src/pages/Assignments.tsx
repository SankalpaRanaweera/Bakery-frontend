import React, { useState, useEffect } from 'react';
import { assignmentsService, Assignment } from '../services/assignments';
import { salespeopleService, Salesperson } from '../services/salespeople';
import { itemsService, BakeryItem } from '../services/items';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Assignments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState<number | null>(null);
  const [assignmentItems, setAssignmentItems] = useState<Array<{ item_id: number; quantity_assigned: number }>>([]);
  const [existingAssignments, setExistingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalespeople();
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedSalesperson && selectedDate) {
      fetchExistingAssignments();
    }
  }, [selectedSalesperson, selectedDate]);

  const fetchSalespeople = async () => {
    try {
      const data = await salespeopleService.getAll();
      setSalespeople(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch salespeople');
    }
  };

  const fetchItems = async () => {
    try {
      const data = await itemsService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch items');
    }
  };

  const fetchExistingAssignments = async () => {
    if (!selectedSalesperson) return;
    try {
      setLoading(true);
      const response = await assignmentsService.getDailyReport(selectedSalesperson, selectedDate);
      setExistingAssignments(response.assignments || []);
    } catch (error) {
      setExistingAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setAssignmentItems([...assignmentItems, { item_id: 0, quantity_assigned: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...assignmentItems];
    updated[index] = { ...updated[index], [field]: parseInt(value) };
    setAssignmentItems(updated);
  };

  const removeItem = (index: number) => {
    setAssignmentItems(assignmentItems.filter((_, i) => i !== index));
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSalesperson) {
      toast.error('Please select a salesperson');
      return;
    }

    if (assignmentItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      await assignmentsService.create({
        salesperson_id: selectedSalesperson,
        date: selectedDate,
        items: assignmentItems,
      });
      
      toast.success('Assignment created successfully!');
      setAssignmentItems([]);
      fetchExistingAssignments();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const handleUpdateReturns = async (assignmentId: number, returnQty: number) => {
    try {
      await assignmentsService.update(assignmentId, { quantity_returned: returnQty });
      toast.success('Returns updated successfully');
      fetchExistingAssignments();
    } catch (error) {
      toast.error('Failed to update returns');
    }
  };

  const totalRevenue = existingAssignments.reduce((sum, a) => sum + parseFloat(a.revenue.toString()), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Daily Assignments</h1>

      {/* Date and Salesperson Selection */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Select Salesperson
            </label>
            <select
              value={selectedSalesperson || ''}
              onChange={(e) => setSelectedSalesperson(Number(e.target.value))}
              className="input-field"
            >
              <option value="">Choose salesperson...</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} ({sp.vehicle_number})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* New Assignment Form */}
      {selectedSalesperson && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">🆕 Create New Assignment</h2>
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            {assignmentItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                  <select
                    value={item.item_id}
                    onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select item...</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} - Rs. {i.price}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity_assigned || ''}
                    onChange={(e) => updateItem(index, 'quantity_assigned', e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
            
            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary"
              >
                ➕ Add Item
              </button>
              
              <button type="submit" className="btn-primary">
                💾 Create Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Assignments */}
      {loading ? (
        <LoadingSpinner />
      ) : existingAssignments.length > 0 ? (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">📋 Today's Assignments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {existingAssignments.map((assignment) => {
                  const sold = assignment.quantity_assigned - assignment.quantity_returned;
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {assignment.item?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{assignment.quantity_assigned}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={assignment.quantity_assigned}
                          defaultValue={assignment.quantity_returned}
                          onBlur={(e) => handleUpdateReturns(assignment.id, Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                        {sold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                        Rs. {assignment.revenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right font-bold text-lg">Total Revenue:</td>
                  <td className="px-6 py-3 font-bold text-amber-600 text-xl">
                    Rs. {totalRevenue.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : selectedSalesperson ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600">No assignments for this date</p>
        </div>
      ) : null}
    </div>
  );
};

export default Assignments;