import React, { useState, useEffect } from 'react';
import FormTemplates from './FormTemplates';
import Submissions from './Submissions';
import TeamManagement from './TeamManagement';
import { FileText, Users, TrendingUp, Mail , Link } from 'lucide-react';
import { submissionService, teamService, templateService } from '../../services/dataService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [stats, setStats] = useState({
    teamMembers: 0,
    templates: 0,
    submissions: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const teamMembers = teamService.getTeamMembers().length;
    const templates = Object.keys(templateService.getTemplates()).length;
    const submissions = submissionService.getSubmissions();
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
    const averageScore = submissions.length > 0 ? totalScore / submissions.length : 0;
    // Add to the tabs array:
  const tabs = [
  { id: 'team', name: 'Team Management', icon: Users },
  { id: 'forms', name: 'Form Templates', icon: FileText },
  { id: 'submissions', name: 'Submissions', icon: Mail },
  { id: 'portals', name: 'Portal Links', icon: Link }, // Add this line
];

// Add to the tab content:
{activeTab === 'portals' && <PortalLinks />}

    setStats({
      teamMembers,
      templates,
      submissions: submissions.length,
      averageScore
    });
  };

  const tabs = [
    { id: 'team', name: 'Team Management', icon: Users },
    { id: 'forms', name: 'Form Templates', icon: FileText },
    { id: 'submissions', name: 'Submissions', icon: Mail },
  ];

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
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
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
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2 inline" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'forms' && <FormTemplates />}
          {activeTab === 'submissions' && <Submissions />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;