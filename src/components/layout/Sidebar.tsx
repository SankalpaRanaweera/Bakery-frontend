import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/salespeople', label: '👥 Salespeople' },
    { path: '/items', label: '🥖 Items' },
    { path: '/assignments', label: '📋 Assignments' },
    { path: '/customers', label: '👨‍👩‍👧‍👦 Customers' },
    { path: '/deliveries', label: '🚚 Deliveries' },
    { path: '/bills', label: '🧾 Bills' },
    { path: '/reports', label: '📈 Reports' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-2">🥐</div>
          <h2 className="text-xl font-bold text-amber-700">Bakery System</h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-100 text-amber-700 font-medium'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;