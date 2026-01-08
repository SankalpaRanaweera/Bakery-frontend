import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-700">
          🥖 Bakery Management
        </h1>

        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-gray-500 capitalize">{user?.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;