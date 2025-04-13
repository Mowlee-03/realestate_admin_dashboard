import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Building2, Users, Plus } from 'lucide-react';
import { UserContext } from '../Provider/Userprovider';

const Sidebar = () => {
  const { user } = useContext(UserContext);

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/properties', icon: <Building2 size={20} />, label: 'Properties' },
    { path: '/posts', icon: <Plus size={20} />, label: 'Add Property' },
    { path: '/users', icon: <Users size={20} />, label: 'Users' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-lg shadow-xl">
        {/* Desktop header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Real Estate Admin
          </h1>
        </div>

        {/* Admin Profile Section */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-12 w-12 rounded-full border-2 border-blue-100 object-cover"
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center mx-2 my-1 px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-medium shadow-sm'
                    : ''
                }`
              }
            >
              {item.icon}
              <span className="ml-3 text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navbar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] rounded-t-2xl shadow-lg border-t border-gray-800">
        <nav className="flex justify-around items-center py-2 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center text-center px-2 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#1A1A1A] shadow-md'
                    : 'text-gray-300 hover:text-gray-100'
                }`
              }
              style={{ width: '20%' }} // Approximate equal width for 5 items
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;