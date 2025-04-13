import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { UserContext } from '../Provider/Userprovider';
import LogoutModal from './auth/LogoutModal';

const MainNavbar = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Map routes to titles
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/properties':
        return 'Properties';
      case '/posts':
        return 'Add Property';
      case '/users':
        return 'Users';
      case '/login':
        return 'Login';
      default:
        if (location.pathname.startsWith('/properties/')) return 'Property Details';
        return 'Real Estate Admin';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setShowLogoutModal(false);
    window.location.reload();
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          {/* Title */}
          <h1 className="text-lg font-semibold text-gray-900 lg:text-xl">
            {getPageTitle()}
          </h1>

          {/* User Profile */}
          {user && (
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                />
                <span className="hidden lg:inline text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <User size={16} className="text-gray-500" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default MainNavbar;