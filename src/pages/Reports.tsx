import React, { useState, useEffect, useCallback } from 'react';
import { reportsService } from '../services/reports';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'unpaid'>('daily');
  const [dailySalesData, setDailySalesData] = useState<any>(null);
  const [unpaidData, setUnpaidData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  

  const fetchDailySales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportsService.getDailySales(selectedDate);
      setDailySalesData(response);
    } catch (error) {
      toast.error('Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchUnpaidDebts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportsService.getUnpaidDebts();
      setUnpaidData(response);
    } catch (error) {
      toast.error('Failed to fetch unpaid debts report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailySales();
    } else {
      fetchUnpaidDebts();
    }
  }, [activeTab, fetchDailySales, fetchUnpaidDebts]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>

      {/* Tabs */}
      <div className="card">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'daily'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Daily Sales Report
          </button>
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'unpaid'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💸 Unpaid Debts Report
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Daily Sales Report */}
          {activeTab === 'daily' && dailySalesData && (
            <div className="space-y-6">
              {/* Date Picker */}
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field max-w-xs"
                />
              </div>

              {/* Overall Stats */}
              <div className="card bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
                <p className="text-4xl font-bold">
                  Rs. {dailySalesData.overall_revenue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm mt-2 opacity-90">
                  for {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>

              {/* Salesperson Breakdown */}
              {dailySalesData.report && dailySalesData.report.length > 0 ? (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Sales by Salesperson</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Salesperson
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Vehicle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailySalesData.report.map((item: any, index: number) => {
                          const percentage = dailySalesData.overall_revenue 
                            ? ((item.total_revenue / dailySalesData.overall_revenue) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {item.salesperson.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                🚚 {item.salesperson.vehicle_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                                Rs. {item.total_revenue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-amber-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600">No sales data for selected date</p>
                </div>
              )}
            </div>
          )}

          {/* Unpaid Debts Report */}
          {activeTab === 'unpaid' && unpaidData && (
            <div className="space-y-6">
              {/* Total Unpaid */}
              <div className="card bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <h3 className="text-lg font-medium mb-2">Total Unpaid Debts</h3>
                <p className="text-4xl font-bold">
                  Rs. {unpaidData.total_unpaid?.toLocaleString() || '0'}
                </p>
                <p className="text-sm mt-2 opacity-90">
                  {unpaidData.unpaid_bills?.length || 0} unpaid bills
                </p>
              </div>

              {/* Unpaid Bills Table */}
              {unpaidData.unpaid_bills && unpaidData.unpaid_bills.length > 0 ? (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Unpaid Bills Details</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Bill #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Salesperson
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Outstanding
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {unpaidData.unpaid_bills.map((bill: any) => (
                          <tr key={bill.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              #{bill.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{bill.customer.name}</div>
                              <div className="text-sm text-gray-500">{bill.customer.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {bill.customer.salesperson?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {new Date(bill.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">
                              Rs. {bill.outstanding_balance.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                bill.payment_status === 'Partial' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {bill.payment_status === 'Partial' ? 'Partial' : 'Unpaid'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-600 text-xl font-medium">All bills are paid!</p>
                  <p className="text-sm text-gray-500 mt-2">No outstanding debts</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;