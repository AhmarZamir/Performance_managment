import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/dataService';
import { Plus, Edit, Trash2, Save, X, User, Mail, Building, Briefcase } from 'lucide-react';

const TeamManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'senior-consultant',
    department: '',
    position: '',
    join_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = () => {
    try {
      const data = teamService.getTeamMembers();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      alert('Please fill in name and email');
      return;
    }

    try {
      teamService.addTeamMember(newEmployee);
      loadTeamMembers();
      setIsAdding(false);
      setNewEmployee({
        name: '',
        email: '',
        role: 'senior-consultant',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee.id);
    setNewEmployee({ ...employee });
  };

  const handleUpdateEmployee = () => {
    try {
      teamService.updateTeamMember(editingEmployee, newEmployee);
      loadTeamMembers();
      setEditingEmployee(null);
      setNewEmployee({
        name: '',
        email: '',
        role: 'senior-consultant',
        department: '',
        position: '',
        join_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleDeleteEmployee = (employeeId) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      try {
        teamService.deleteTeamMember(employeeId);
        loadTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-1">Manage your team members and their details</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingEmployee) && (
        <div className="bg-white p-6 rounded-lg border animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdding ? 'Add New Team Member' : 'Edit Team Member'}
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingEmployee(null);
                setNewEmployee({
                  name: '',
                  email: '',
                  role: 'senior-consultant',
                  department: '',
                  position: '',
                  join_date: new Date().toISOString().split('T')[0]
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="senior-consultant">Senior Consultant</option>
                <option value="consultant">Consultant</option>
                <option value="junior-consultant">Junior Consultant</option>
                <option value="manager">Manager</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingEmployee(null);
                setNewEmployee({
                  name: '',
                  email: '',
                  role: 'senior-consultant',
                  department: '',
                  position: '',
                  join_date: new Date().toISOString().split('T')[0]
                });
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={isAdding ? handleAddEmployee : handleUpdateEmployee}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isAdding ? 'Add Member' : 'Update Member'}
            </button>
          </div>
        </div>
      )}

      {/* Team Members Grid */}
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
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {employee.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {employees.length === 0 && !isAdding && (
        <div className="bg-white p-12 rounded-lg border text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first team member to the system.</p>
          <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add First Member
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;