import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Globe, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Glossa
            </span>
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/services" className="flex items-center space-x-2 text-gray-600 hover:text-orange-500">
              <Globe className="h-5 w-5" />
              <span>Services</span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-orange-500">
                  <Settings className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 text-gray-600 hover:text-orange-500">
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;