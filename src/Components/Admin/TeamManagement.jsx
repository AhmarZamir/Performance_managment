import React, { useState, useEffect } from 'react';
import { teamService, templateService, submissionService, authService } from '../../services/supabaseService';
import { Plus, Edit, Trash2, Save, X, User, Mail, Building, Briefcase, Key, UserCheck, Eye, EyeOff } from 'lucide-react';

const TeamManagement = ({ onDataUpdate }) => {
  const [employees, setEmployees] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'senior-consultant',
    department: '',
    position: '',
    join_date: new Date().toISOString().split('T')[0]
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const data = await teamService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading team members:', error);
      alert('Error loading team members. Please check if Supabase is connected.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.email.trim() || 
        !newEmployee.username.trim() || !newEmployee.password.trim()) {
      alert('Please fill in all required fields: name, email, username, and password');
      return;
    }

    // Validate password length
    if (newEmployee.password.length < 4) {
      alert('Password must be at least 4 characters long');
      return;
    }

    try {
      // Use auth service to create employee with credentials
      await authService.createEmployeeWithAuth(newEmployee);
      await loadTeamMembers();
      setIsAdding(false);
      setNewEmployee({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'senior-consultant',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
      setShowPassword(false); // Reset password visibility
      
      // Refresh dashboard stats
      if (onDataUpdate) onDataUpdate();
      
      alert('Team member added successfully with login credentials!');
    } catch (error) {
      console.error('Error adding team member:', error);
      if (error.message.includes('unique constraint')) {
        alert('Error: Username already exists. Please choose a different username.');
      } else {
        alert('Error adding team member. Please try again.');
      }
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee.id);
    setNewEmployee({ 
      name: employee.name,
      email: employee.email,
      username: employee.username || '',
      password: '', // Don't show existing password for security
      role: employee.role || 'senior-consultant',
      department: employee.department || '',
      position: employee.position || '',
      join_date: employee.join_date || new Date().toISOString().split('T')[0]
    });
    setShowPassword(false); // Reset password visibility when editing
  };

  const handleUpdateEmployee = async () => {
    try {
      // Prepare update data (exclude password if empty)
      const updateData = { ...newEmployee };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      if (updateData.password) {
        // If password is provided, update using auth service
        await authService.updateEmployeePassword(editingEmployee, updateData.password);
        delete updateData.password; // Remove password from employee update
      }
      
      // Update employee details
      await teamService.updateEmployee(editingEmployee, updateData);
      await loadTeamMembers();
      setEditingEmployee(null);
      setNewEmployee({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'senior-consultant',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
      setShowPassword(false); // Reset password visibility
      
      // Refresh dashboard stats
      if (onDataUpdate) onDataUpdate();
      
      alert('Team member updated successfully!' + (updateData.password ? ' Password has been updated.' : ''));
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Error updating team member. Please try again.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (confirm('Are you sure you want to remove this team member? This will also delete their login credentials.')) {
      try {
        await teamService.deleteEmployee(employeeId);
        await loadTeamMembers();
        
        // Refresh dashboard stats
        if (onDataUpdate) onDataUpdate();
        
        alert('Team member deleted successfully!');
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error deleting team member. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingEmployee(null);
    setNewEmployee({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'senior-consultant',
      department: '',
      position: '',
      join_date: new Date().toISOString().split('T')[0]
    });
    setShowPassword(false); // Reset password visibility
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-1">Manage your team members and their login credentials</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading team members...</span>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingEmployee) && (
        <div className="bg-white p-6 rounded-lg border animate-slide-up shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdding ? 'Add New Team Member' : 'Edit Team Member'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter username for login"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password {isAdding ? '*' : ''}
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={isAdding ? "Set initial password" : "Leave blank to keep current"}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isAdding && (
                <p className="text-xs text-gray-500 mt-1">Minimum 4 characters required</p>
              )}
              {!isAdding && (
                <p className="text-xs text-gray-500 mt-1">Enter new password only if you want to change it</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g., Technology, Consulting"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g., Senior Consultant"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                 value={newEmployee.role}
                 onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                 <option value="principal-consultant">Principal Consultant</option>
                 <option value="senior-consultant">Senior Consultant</option>
                 <option value="consultant">Consultant</option>
                 <option value="senior-bi-developer">Senior BI Developer</option>
                 <option value="bi-developer">BI Developer</option>
             </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Join Date
              </label>
              <input
                type="date"
                value={newEmployee.join_date}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, join_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={isAdding ? handleAddEmployee : handleUpdateEmployee}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isAdding ? 'Add Member' : 'Update Member'}
            </button>
          </div>
        </div>
      )}

      {/* Team Members Grid */}
      {!loading && employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {employee.email}
                    </p>
                    {employee.username && (
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Username: {employee.username}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{employee.department || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>{employee.position || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Joined: {new Date(employee.join_date).toLocaleDateString()}</span>
                  <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {employee.role?.replace('-', ' ') || 'employee'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && employees.length === 0 && !isAdding && (
        <div className="bg-white p-12 rounded-lg border text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first team member to the system.</p>
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Member
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;