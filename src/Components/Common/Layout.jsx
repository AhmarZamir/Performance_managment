import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Portal</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/admin/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/team" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Team
              </Link>
              <Link 
                to="/admin/templates" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Templates
              </Link>
              <Link 
                to="/admin/submissions" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Submissions
              </Link>
              <Link 
                to="/admin/portal-links" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Portal Links
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2 flex space-x-4 overflow-x-auto">
          <Link 
            to="/admin/dashboard" 
            className="whitespace-nowrap text-sm text-gray-700 hover:text-blue-600 font-medium"
          >
            Dashboard
          </Link>
          <Link 
            to="/admin/team" 
            className="whitespace-nowrap text-sm text-gray-700 hover:text-blue-600 font-medium"
          >
            Team
          </Link>
          <Link 
            to="/admin/templates" 
            className="whitespace-nowrap text-sm text-gray-700 hover:text-blue-600 font-medium"
          >
            Templates
          </Link>
          <Link 
            to="/admin/submissions" 
            className="whitespace-nowrap text-sm text-gray-700 hover:text-blue-600 font-medium"
          >
            Submissions
          </Link>
          <Link 
            to="/admin/portal-links" 
            className="whitespace-nowrap text-sm text-gray-700 hover:text-blue-600 font-medium"
          >
            Links
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;