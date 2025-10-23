import React, { useState, useEffect } from 'react';
import FormTemplates from './FormTemplates';
import Submissions from './Submissions';
import TeamManagement from './TeamManagement';
import PortalLinks from './PortalLinks';
import { FileText, Users, TrendingUp, Mail, Link } from 'lucide-react';
import { teamService, templateService, submissionService } from '../../services/supabaseService'
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [stats, setStats] = useState({
    teamMembers: 0,
    templates: 0,
    submissions: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [employees, templates, submissions] = await Promise.all([
        teamService.getEmployees(), // FIXED: Changed from getTeamMembers() to getEmployees()
        templateService.getTemplates(),
        submissionService.getSubmissions()
      ]);

      // Calculate average score
      const totalScore = submissions.reduce((sum, sub) => {
        const formData = sub.formData || {};
        const score = formData.totalScore || formData.rating || 0;
        return sum + score;
      }, 0);
      
      const averageScore = submissions.length > 0 ? totalScore / submissions.length : 0;

      setStats({
        teamMembers: employees.length,
        templates: templates.length,
        submissions: submissions.length,
        averageScore: parseFloat(averageScore.toFixed(1))
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'team', name: 'Team Management', icon: Users },
    { id: 'forms', name: 'Form Templates', icon: FileText },
    { id: 'submissions', name: 'Submissions', icon: Mail },
    { id: 'portals', name: 'Portal Links', icon: Link }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your team, evaluation forms, and track performance submissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mr-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Form Templates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.templates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mr-4">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.submissions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'team' && <TeamManagement onDataUpdate={loadStats} />}
          {activeTab === 'forms' && <FormTemplates onDataUpdate={loadStats} />}
          {activeTab === 'submissions' && <Submissions onDataUpdate={loadStats} />}
          {activeTab === 'portals' && <PortalLinks />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;