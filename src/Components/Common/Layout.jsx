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
                <img 
                  src="/optronix_ai_logo.jpg" 
                  alt="Optronix AI Logo"
                  className="h-33 w-39 object-cover rounded"
                />
               
              </Link>
            </div>

            {/* Navigation */}
           

            {/* User Menu */}
            <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-gray-900"> Optronix AI</span>
             
             
             
             
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