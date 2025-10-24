import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './Dashboard';
import { teamService, templateService, submissionService } from '../../services/supabaseService'
import { ArrowLeft, Shield, AlertCircle, Users } from 'lucide-react';

const ROLES = {
  'principal-consultant': 'Principal Consultant',
  'senior-consultant': 'Senior Consultant',
  'consultant': 'Consultant',
  'senior-bi-developer': 'Senior BI Developer',
  'bi-developer': 'BI Developer'
};

const EmployeePortal = ({ role }) => {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [accessError, setAccessError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    validateAccess();
    loadPortalData();
  }, [role]);

  const validateAccess = () => {
    if (!ROLES[role]) {
      setAccessError(`Invalid role access: ${role}`);
      return;
    }
    setAccessError('');
  };

  const loadPortalData = async () => {
    try {
      setLoading(true);
      
      // Load employees for this role
      const allEmployees = await teamService.getEmployees();
      const roleEmployees = allEmployees.filter(emp => emp.role === role);
      setEmployees(roleEmployees);

      // Load templates for this role
      const allTemplates = await templateService.getTemplates();
      const roleTemplates = allTemplates.filter(template => template.role === role);
      setTemplates(roleTemplates);

    } catch (error) {
      console.error('Error loading portal data:', error);
      setAccessError('Error loading portal data. Please check if JSON Server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };

  if (accessError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg border shadow-sm text-center max-w-md">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{accessError}</p>
          <div className="space-y-3">
            <button
              onClick={handleBackToAdmin}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </button>
          </div>
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Performance Portal</h1>
                <p className="text-sm text-gray-500">Secure Evaluation System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {ROLES[role]} Portal
              </span>
              <div className="text-sm text-gray-500">
                {employees.length} members • {templates.length} forms
              </div>
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
              Secure {ROLES[role]} Portal - Access restricted to {ROLES[role]} members only
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading portal data...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <EmployeeDashboard 
            employee={currentEmployee}
            setCurrentEmployee={setCurrentEmployee}
            forcedRole={role}
            portalEmployees={employees}
            portalTemplates={templates}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              © 2024 Performance Evaluation System
            </div>
            <div className="text-sm text-gray-500">
              {ROLES[role]} Portal • {employees.length} team members • {templates.length} evaluation forms
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployeePortal;