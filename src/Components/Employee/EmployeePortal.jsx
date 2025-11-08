import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './Dashboard';
import EmployeeLogin from './EmployeeLogin';
import { teamService, templateService } from '../../services/supabaseService';
import { ArrowLeft, Shield, AlertCircle, Users, LogOut } from 'lucide-react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    checkExistingSession();
    validateAccess();
    loadPortalData();
  }, [role]);

  // Check if user already has a valid session
  const checkExistingSession = () => {
    try {
      const savedSession = localStorage.getItem('employeeSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        const { employee, timestamp, role: savedRole } = sessionData;
        
        // Check if session is still valid (less than 24 hours old) and role matches
        const isSessionValid = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours
        const isRoleMatch = savedRole === role;
        
        if (isSessionValid && isRoleMatch && employee) {
          setCurrentEmployee(employee);
          setIsAuthenticated(true);
        } else {
          // Clear invalid session
          localStorage.removeItem('employeeSession');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('employeeSession');
    }
  };

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
      setAccessError('Error loading portal data. Please check if Supabase is connected.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (employee) => {
    // Verify that the logged-in employee belongs to the correct role
    if (employee.role !== role) {
      setAccessError(`Access denied. You are registered as ${ROLES[employee.role]}, not ${ROLES[role]}.`);
      return;
    }
    
    // Set employee data and authentication state
    setCurrentEmployee(employee);
    setIsAuthenticated(true);
    setAccessError('');
    
    // Save session to localStorage for persistence
    const sessionData = {
      employee: employee,
      timestamp: Date.now(),
      role: role
    };
    localStorage.setItem('employeeSession', JSON.stringify(sessionData));
  };

  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    // Clear React state
    setCurrentEmployee(null);
    setIsAuthenticated(false);
    setAccessError('');
    
    // Clear session storage
    localStorage.removeItem('employeeSession');
    sessionStorage.removeItem('employeeSession');
    
    // Optional: Clear any other related storage
    // localStorage.removeItem('employeeFormData');
    // localStorage.removeItem('employeePreferences');
    
    console.log('Employee logged out successfully');
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <EmployeeLogin 
        onLoginSuccess={handleLoginSuccess}
        onBackToAdmin={handleBackToAdmin}
      />
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg border shadow-sm text-center max-w-md">
          <div className="flex justify-center mb-4">
            <img 
              src="/optronix_ai_logo.jpg" 
              alt="Optronix AI Logo"
              className="h-6 w-36 object-cover rounded"
            />
          </div>
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{accessError}</p>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Back to Login
            </button>
            <button
              onClick={handleBackToAdmin}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors"
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
              <img 
                src="/optronix_ai_logo.jpg" 
                alt="Optronix AI Logo"
                className="h-6 w-36 object-cover rounded mr-3"
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">Optronix AI</h1>
                <p className="text-sm text-gray-500">
                  Welcome, {currentEmployee?.name}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {ROLES[role]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Security Notice */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
              <p className="text-sm text-blue-700">
                Secure {ROLES[role]} Portal - Welcome {currentEmployee?.name}
              </p>
            </div>
            <div className="text-xs text-blue-600">
              Session active • Role: {ROLES[role]}
            </div>
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
            onLogout={handleLogout}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/optronix_ai_logo.jpg" 
                alt="Optronix AI Logo"
                className="h-6 w-36 object-cover rounded mr-2"
              />
              <span className="text-sm text-gray-600">Optronix AI Performance System</span>
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