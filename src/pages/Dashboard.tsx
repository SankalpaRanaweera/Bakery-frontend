import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Salespeople</p>
              <p className="text-2xl font-bold text-blue-500">12</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-500">Rs. 45,000</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unpaid Bills</p>
              <p className="text-2xl font-bold text-red-500">Rs. 12,500</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-purple-500">156</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <span className="text-3xl">🏪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Bakery Management System! 🥖</h2>
        <p className="text-gray-600 mb-4">
          This system helps you manage your bakery sales operations efficiently.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-center">
            <span className="text-3xl block mb-2">➕</span>
            <span className="text-sm font-medium">New Assignment</span>
          </button>
          <button className="p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-center">
            <span className="text-3xl block mb-2">🚚</span>
            <span className="text-sm font-medium">Record Delivery</span>
          </button>
          <button className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-center">
            <span className="text-3xl block mb-2">🧾</span>
            <span className="text-sm font-medium">Generate Bill</span>
          </button>
          <button className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-center">
            <span className="text-3xl block mb-2">📊</span>
            <span className="text-sm font-medium">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;