import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Building2, Users, Menu, X, Plus,LogOut } from 'lucide-react';
import LogoutModal from './auth/LogoutModal';
import { UserContext } from '../Provider/Userprovider';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const {user} = useContext(UserContext)

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/properties', icon: <Building2 size={20} />, label: 'Properties' },
    { path: '/posts', icon: <Plus size={20} />, label: 'Add Property' },
    { path: '/users', icon: <Users size={20} />, label: 'Users' },
  ];


  const handleLogout = () => {
    localStorage.removeItem('user');
    setShowLogoutModal(false);
    window.location.reload()
    navigate('/login');
  };
  return (
    <>
     {/* Mobile menu button */}
     <div className="lg:hidden fixed top-4 z-50 left-2 right-0 h-16 ">
        <button
          className="p-2 bg-white shadow-sm  rounded-md text-gray-600 hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Desktop header */}
        <div className="hidden lg:block p-6">
          <h1 className="text-2xl font-bold text-gray-800">Real Estate Admin</h1>
        </div>
        
        {/* Mobile top spacing */}
        <div className="h-16 lg:hidden" />
        
        {/* Admin Profile Section */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{user?.name}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActive ? 'bg-gray-100 border-r-4 border-blue-500' : ''
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
      
      
    </>
  );
};

export default Sidebar;