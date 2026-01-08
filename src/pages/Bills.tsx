import React, { useEffect, useState, useCallback } from 'react';
import { billsService, Bill } from '../services/bills';
import { customersService, Customer } from '../services/customers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  const [generateForm, setGenerateForm] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [paymentAmount, setPaymentAmount] = useState('');

  

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { payment_status: filterStatus } : {};
      const response = await billsService.getAll(params);
      setBills(response.data);
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customersService.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  }, []);

  useEffect(() => {
    fetchBills();
    fetchCustomers();
  }, [fetchBills, fetchCustomers]);

  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generateForm.customer_id) {
      toast.error('Please select a customer');
      return;
    }

    try {
      await billsService.generateBill({
        customer_id: parseInt(generateForm.customer_id),
        date: generateForm.date,
      });

      toast.success('Bill generated successfully!');
      setShowGenerateModal(false);
      setGenerateForm({ customer_id: '', date: new Date().toISOString().split('T')[0] });
      fetchBills();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate bill');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBill) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > selectedBill.outstanding_balance) {
      toast.error('Payment amount cannot exceed outstanding balance');
      return;
    }

    try {
      const totalPaid = selectedBill.paid_amount + amount;
      await billsService.updatePayment(selectedBill.id, totalPaid);
      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedBill(null);
      fetchBills();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const openPaymentModal = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.outstanding_balance.toString());
    setShowPaymentModal(true);
  };

  const handlePrint = async (billId: number) => {
    try {
      const printData = await billsService.getPrintData(billId);
      
      // Simple browser print
      const printWindow = window.open('', '', 'width=300,height=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Bill</title>');
        printWindow.document.write('<style>body{font-family:monospace;font-size:12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<pre>');
        
        printData.thermal_data.forEach((line: any) => {
          if (line.type === 'text') {
            printWindow.document.write(line.value + '\n');
          }
        });
        
        printWindow.document.write('</pre></body></html>');
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print bill');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'N/A': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OK': return 'Paid';
      case 'Partial': return 'Partial';
      case 'N/A': return 'Unpaid';
      default: return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalPaid = bills.filter(b => b.payment_status === 'OK').reduce((sum, b) => sum + b.total_amount, 0);
  const totalPartial = bills.filter(b => b.payment_status === 'Partial').reduce((sum, b) => sum + b.outstanding_balance, 0);
  const totalUnpaid = bills.filter(b => b.payment_status === 'N/A').reduce((sum, b) => sum + b.outstanding_balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Bills & Payments</h1>
        <button onClick={() => setShowGenerateModal(true)} className="btn-primary">
          🧾 Generate Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50">
          <h3 className="text-sm text-gray-600 mb-2">💚 Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">
            Rs. {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="card bg-yellow-50">
          <h3 className="text-sm text-gray-600 mb-2">⚠️ Partial Payments</h3>
          <p className="text-2xl font-bold text-yellow-600">
            Rs. {totalPartial.toLocaleString()}
          </p>
        </div>
        <div className="card bg-red-50">
          <h3 className="text-sm text-gray-600 mb-2">❌ Total Unpaid</h3>
          <p className="text-2xl font-bold text-red-600">
            Rs. {totalUnpaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Payment Status
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Status</option>
          <option value="OK">Paid</option>
          <option value="Partial">Partially Paid</option>
          <option value="N/A">Unpaid</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">#{bill.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{bill.customer?.name}</div>
                    <div className="text-sm text-gray-500">{bill.customer?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(bill.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    Rs. {bill.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    Rs. {bill.paid_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">
                    Rs. {bill.outstanding_balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.payment_status)}`}>
                      {getStatusLabel(bill.payment_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handlePrint(bill.id)}
                      className="text-amber-600 hover:text-amber-900"
                      title="Print Bill"
                    >
                      🖨️
                    </button>
                    {bill.payment_status !== 'OK' && (
                      <button
                        onClick={() => openPaymentModal(bill)}
                        className="text-green-600 hover:text-green-900"
                        title="Record Payment"
                      >
                        💰
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bills.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-medium">No bills found</p>
              <p className="text-sm mt-2">Click "Generate Bill" to create your first bill</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">🧾 Generate Bill</h2>
            <form onSubmit={handleGenerateBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer *
                </label>
                <select
                  value={generateForm.customer_id}
                  onChange={(e) => setGenerateForm({ ...generateForm, customer_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Choose customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Date *
                </label>
                <input
                  type="date"
                  value={generateForm.date}
                  onChange={(e) => setGenerateForm({ ...generateForm, date: e.target.value })}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bill will be generated based on deliveries for this date
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">💰 Record Payment</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{selectedBill.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">Rs. {selectedBill.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Already Paid:</span>
                <span className="font-medium text-green-600">Rs. {selectedBill.paid_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-medium">Outstanding:</span>
                <span className="font-bold text-red-600">Rs. {selectedBill.outstanding_balance.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;

