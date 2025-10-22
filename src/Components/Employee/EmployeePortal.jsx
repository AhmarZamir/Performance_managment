import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './Dashboard';
import { teamService, ROLES } from '../../services/dataService';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';

const EmployeePortal = ({ role }) => {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [accessError, setAccessError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    validateAccess();
    loadTeamMembers();
  }, [role]);

  const validateAccess = () => {
    if (!ROLES[role]) {
      setAccessError('Invalid role access');
      return;
    }
    setAccessError('');
  };

  const loadTeamMembers = () => {
    try {
      const roleEmployees = teamService.getTeamMembersByRole(role);
      setEmployees(roleEmployees);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  if (accessError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg border shadow-sm text-center max-w-md">
          <div className="flex justify-center mb-4">
            <img 
              src="/optronix_ai_logo.jpg" 
              alt="Optronix AI Logo"
              className="h-12 w-12 object-cover rounded"
            />
          </div>
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Invalid role access URL.</p>
          <button
            onClick={handleBackToAdmin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Custom Logo */}
              <img 
                src="/optronix_ai_logo.jpg" 
                alt="Optronix AI Logo"
                className="h-8 w-8 object-cover rounded mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {ROLES[role]} Portal
                </h1>
                <p className="text-sm text-gray-500">Secure Performance Evaluation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {ROLES[role]}
              </span>
              <button
                onClick={handleBackToAdmin}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Security Notice */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
            <p className="text-sm text-blue-700">
              Secure {ROLES[role]} Portal - Access restricted to {ROLES[role]} role only
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <EmployeeDashboard 
          employee={currentEmployee}
          setCurrentEmployee={setCurrentEmployee}
          forcedRole={role}
        />
      </main>
    </div>
  );
};

export default EmployeePortal;