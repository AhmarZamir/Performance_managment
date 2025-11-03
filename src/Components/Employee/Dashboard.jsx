import React, { useState, useEffect } from 'react';
import PerformanceForm from './PerformanceForm';
import { User, FileText, Award, Clock, Star, Users, Shield } from 'lucide-react';

const ROLES = {
  'principal-consultant': 'Principal Consultant',
  'senior-consultant': 'Senior Consultant',
  'consultant': 'Consultant',
  'senior-bi-developer': 'Senior BI Developer',
  'bi-developer': 'BI Developer'
};

const EmployeeDashboard = ({ 
  employee, 
  setCurrentEmployee, 
  forcedRole = null,
  portalEmployees = [],
  portalTemplates = [] 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedRole, setSelectedRole] = useState(forcedRole);

  const isRoleLocked = !!forcedRole;

  useEffect(() => {
    if (portalEmployees.length > 0) {
      setEmployees(portalEmployees);
    }
    if (portalTemplates.length > 0) {
      setTemplates(portalTemplates);
    }
  }, [portalEmployees, portalTemplates]);

  // Group employees by role (only if not role-locked)
  const employeesByRole = isRoleLocked ? { [forcedRole]: employees } : 
    employees.reduce((acc, employee) => {
      if (!acc[employee.role]) {
        acc[employee.role] = [];
      }
      acc[employee.role].push(employee);
      return acc;
    }, {});

  // Role selection view (only show if not role-locked)
  if (!selectedRole && !employee && !isRoleLocked) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Performance Portal</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select your role to access your performance evaluation forms.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(ROLES).map(([roleKey, roleName]) => (
            <div
              key={roleKey}
              onClick={() => setSelectedRole(roleKey)}
              className="bg-white p-6 rounded-lg border cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{roleName}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {employeesByRole[roleKey]?.length || 0} team members
              </p>
              <div className="text-xs text-blue-600 font-medium">Click to select</div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg border text-center">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </div>
          <div className="bg-white p-6 rounded-lg border text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-600">Form Templates</div>
          </div>
          <div className="bg-white p-6 rounded-lg border text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">15</div>
            <div className="text-sm text-gray-600">Days Remaining</div>
          </div>
          <div className="bg-white p-6 rounded-lg border text-center">
            <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Object.keys(ROLES).length}</div>
            <div className="text-sm text-gray-600">Role Types</div>
          </div>
        </div>
      </div>
    );
  }

  // Employee selection view for selected role
  if (selectedRole && !employee) {
    const roleEmployees = employeesByRole[selectedRole] || [];
    const roleTemplates = templates.filter(t => t.role === selectedRole);

    return (
      <div className="space-y-8 animate-fade-in">
        {!isRoleLocked && (
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Roles
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{ROLES[selectedRole]} Portal</h1>
              <p className="text-gray-600 mt-1">
                Select your profile to access {ROLES[selectedRole]} performance evaluations
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">{roleEmployees.length} team members</span>
                <span className="text-sm text-gray-500">{roleTemplates.length} evaluation forms</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isRoleLocked && (
                <Shield className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setCurrentEmployee(emp)}
                className="bg-white p-6 rounded-lg border cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-sm text-gray-500">{emp.email}</p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.position || ROLES[emp.role] || 'Employee'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Click to start evaluation</span>
                  <FileText className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state for role */}
          {roleEmployees.length === 0 && (
            <div className="bg-white p-12 rounded-lg border text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members in this role</h3>
              <p className="text-gray-600">There are no employees assigned to the {ROLES[selectedRole]} role.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Performance form view
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Enhanced Employee Header */}
      <div className="bg-white p-8 rounded-lg border relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600 text-lg mt-1">{employee.email}</p>
              <div className="flex items-center space-x-2 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {employee.position || ROLES[employee.role] || 'Employee'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  Active
                </span>
                {isRoleLocked && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure Portal
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">         

         
            {!isRoleLocked && (
              <button
                onClick={() => {
                  setCurrentEmployee(null);
                  setSelectedRole(null);
                }}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Change Role
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Performance Form */}
      <PerformanceForm employee={employee} roleTemplates={templates} />
    </div>
  );
};

export default EmployeeDashboard;