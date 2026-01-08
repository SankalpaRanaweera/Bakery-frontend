import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Salespeople from './pages/Salespeople';
import Items from './pages/Items';
import Assignments from './pages/Assignments';
import Customers from './pages/Customers';
import Deliveries from './pages/Deliveries';
import Bills from './pages/Bills';
import Reports from './pages/Reports';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - All pages inside Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Salespeople Management */}
            <Route path="/salespeople" element={<Salespeople />} />
            
            {/* Items Management */}
            <Route path="/items" element={<Items />} />
            
            {/* Daily Assignments */}
            <Route path="/assignments" element={<Assignments />} />
            
            {/* Customer Management */}
            <Route path="/customers" element={<Customers />} />
            
            {/* Deliveries Tracking */}
            <Route path="/deliveries" element={<Deliveries />} />
            
            {/* Bills & Payments */}
            <Route path="/bills" element={<Bills />} />
            
            {/* Reports & Analytics */}
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;