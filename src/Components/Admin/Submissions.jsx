import React, { useState, useEffect } from 'react';
import { submissionService } from '../../services/supabaseService';
import { Download, Eye, Trash2, User, Mail, FileText, Calendar } from 'lucide-react';

const ROLES = {
  'principal-consultant': 'Principal Consultant',
  'senior-consultant': 'Senior Consultant',
  'consultant': 'Consultant',
  'senior-bi-developer': 'Senior BI Developer',
  'bi-developer': 'BI Developer'
};

const Submissions = ({ onDataUpdate }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Error loading submissions. Please check if Supabase is connected.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = filterRole === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.role === filterRole);

  // Enhanced Excel Export with Complete Details
  const exportToExcel = () => {
    try {
      const dataToExport = filterRole === 'all' ? submissions : filteredSubmissions;
      
      if (dataToExport.length === 0) {
        alert('No submissions to export');
        return;
      }

      // Create comprehensive CSV content
      const headers = [
        'Employee Name',
        'Employee Email', 
        'Employee ID',
        'Role',
        'Form Type',
        'Template ID',
        'Status',
        'Submission Date',
        'Total Score',
        'Max Score',
        'Percentage',
      ];

      // Get all unique criteria names across all submissions
      const allCriteria = new Set();
      dataToExport.forEach(sub => {
        const evaluations = sub.form_data?.evaluations || [];
        evaluations.forEach(evalItem => {
          allCriteria.add(evalItem.criteria);
        });
      });

      // Add criteria score and comment headers
      const criteriaHeaders = [];
      allCriteria.forEach(criteria => {
        criteriaHeaders.push(`${criteria} Score`);
        criteriaHeaders.push(`${criteria} Comments`);
      });

      const allHeaders = [...headers, ...criteriaHeaders];
      
      const csvRows = dataToExport.map(sub => {
        const formData = sub.form_data || {};
        const evaluations = formData.evaluations || [];
        const totalScore = formData.totalScore || formData.rating || 0;
        const maxScore = formData.maxTotalScore || 100;
        const percentage = ((totalScore / maxScore) * 100).toFixed(1);

        // Base row data
        const baseRow = [
          `"${sub.employee_name || 'N/A'}"`,
          `"${sub.employee_email || 'N/A'}"`,
          `"${sub.employee_id || 'N/A'}"`,
          `"${ROLES[sub.role] || sub.role}"`,
          `"${sub.form_type || 'Performance Review'}"`,
          `"${sub.template_id || 'N/A'}"`,
          `"${sub.status || 'submitted'}"`,
          `"${new Date(sub.submitted_at).toLocaleDateString()}"`,
          totalScore,
          maxScore,
          percentage
        ];

        // Add criteria scores and comments
        const criteriaData = [];
        allCriteria.forEach(criteria => {
          const evaluation = evaluations.find(e => e.criteria === criteria);
          if (evaluation) {
            criteriaData.push(evaluation.selfScore || evaluation.score || 0);
            criteriaData.push(`"${evaluation.selfComment || evaluation.comments || 'No comments'}"`);
          } else {
            criteriaData.push('N/A');
            criteriaData.push('"N/A"');
          }
        });

        return [...baseRow, ...criteriaData].join(',');
      });

      const csvContent = [allHeaders.join(','), ...csvRows].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `complete-performance-data-${filterRole === 'all' ? 'all-roles' : filterRole}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${dataToExport.length} submissions with complete details!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data: ' + error.message);
    }
  };

  // Alternative: Export Individual Submission
  const exportIndividualSubmission = (submission) => {
    try {
      const formData = submission.form_data || {};
      const evaluations = formData.evaluations || [];
      const totalScore = formData.totalScore || formData.rating || 0;
      const maxScore = formData.maxTotalScore || 100;
      const percentage = ((totalScore / maxScore) * 100).toFixed(1);

      const headers = [
        'Field', 'Value'
      ];

      const rows = [
        ['Employee Name', submission.employee_name],
        ['Employee Email', submission.employee_email],
        ['Employee ID', submission.employee_id],
        ['Role', ROLES[submission.role] || submission.role],
        ['Form Type', submission.form_type],
        ['Template ID', submission.template_id],
        ['Status', submission.status],
        ['Submission Date', new Date(submission.submitted_at).toLocaleString()],
        ['Total Score', totalScore],
        ['Max Score', maxScore],
        ['Percentage', percentage + '%'],
        ['', ''], // Empty row for separation
        ['CRITERIA BREAKDOWN', ''],
        ['Criteria', 'Score', 'Max Marks', 'Percentage', 'Comments']
      ];

      // Add criteria details
      evaluations.forEach(evalItem => {
        const score = evalItem.selfScore || evalItem.score || 0;
        const maxMarks = evalItem.maxMarks || 1;
        const critPercentage = ((score / maxMarks) * 100).toFixed(1);
        rows.push([
          evalItem.criteria,
          score,
          maxMarks,
          critPercentage + '%',
          evalItem.selfComment || evalItem.comments || 'No comments'
        ]);
      });

      const csvContent = rows.map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `performance-${submission.employee_name}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported individual submission for ${submission.employee_name}!`);
    } catch (error) {
      console.error('Error exporting individual submission:', error);
      alert('Error exporting individual data: ' + error.message);
    }
  };

  const deleteSubmission = async (submissionId) => {
    if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        await submissionService.deleteSubmission(submissionId);
        await loadSubmissions();
        setSelectedSubmission(null);
        
        if (onDataUpdate) onDataUpdate();
        
        alert('Submission deleted successfully!');
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Error deleting submission: ' + error.message);
      }
    }
  };

  const viewSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading submissions...</span>
      </div>
    );
  }

  const displaySubmissions = filterRole === 'all' ? submissions : filteredSubmissions;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Submissions</h2>
          <p className="text-gray-600 mt-1">View and manage all submitted performance evaluations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Showing: {displaySubmissions.length} submissions
            {filterRole !== 'all' && ` (Filtered by ${ROLES[filterRole]})`}
          </div>
          {submissions.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
                title="Export all submissions with complete details"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role Filter */}
      {submissions.length > 0 && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="all">All Roles</option>
              {Object.entries(ROLES).map(([roleKey, roleName]) => (
                <option key={roleKey} value={roleKey}>{roleName}</option>
              ))}
            </select>
            {filterRole !== 'all' && (
              <button
                onClick={() => setFilterRole('all')}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Submission Details</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportIndividualSubmission(selectedSubmission)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export This
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Employee Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="text-gray-900">{selectedSubmission.employee_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{selectedSubmission.employee_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Employee ID:</span>
                      <span className="text-gray-900">{selectedSubmission.employee_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Role:</span>
                      <span className="text-gray-900">{ROLES[selectedSubmission.role] || selectedSubmission.role}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Evaluation Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Form Type:</span>
                      <span className="text-gray-900">{selectedSubmission.form_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Template ID:</span>
                      <span className="text-gray-900">{selectedSubmission.template_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="text-gray-900 capitalize">{selectedSubmission.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <span className="text-gray-900">{new Date(selectedSubmission.submitted_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Summary */}
              {selectedSubmission.form_data && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Score Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedSubmission.form_data.totalScore || selectedSubmission.form_data.rating || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Score</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedSubmission.form_data.maxTotalScore || 100}
                      </div>
                      <div className="text-sm text-gray-600">Max Score</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(((selectedSubmission.form_data.totalScore || selectedSubmission.form_data.rating || 0) / 
                          (selectedSubmission.form_data.maxTotalScore || 100)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Percentage</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Evaluation Criteria */}
              {selectedSubmission.form_data?.evaluations && selectedSubmission.form_data.evaluations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Detailed Evaluation</h4>
                  <div className="space-y-4">
                    {selectedSubmission.form_data.evaluations.map((evalItem, index) => {
                      const score = evalItem.selfScore || evalItem.score || 0;
                      const maxMarks = evalItem.maxMarks || 1;
                      const percentage = (score / maxMarks) * 100;
                      
                      return (
                        <div key={index} className="border rounded-lg p-4 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="font-medium text-gray-700 text-sm">Criteria</p>
                              <p className="text-gray-900 font-semibold">{evalItem.criteria}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 text-sm">Description</p>
                              <p className="text-gray-900">{evalItem.description}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 text-sm">Score</p>
                              <p className="text-gray-900 font-semibold">
                                {score}/{maxMarks}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    percentage >= 80 ? 'bg-green-500' :
                                    percentage >= 60 ? 'bg-blue-500' :
                                    percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 text-sm">Max Marks</p>
                              <p className="text-gray-900">{maxMarks}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700 text-sm mb-2">Comments</p>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded text-sm">
                              {evalItem.selfComment || evalItem.comments || 'No comments provided'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Submission
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Submissions Table */}
      {displaySubmissions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filterRole === 'all' ? 'No submissions yet' : `No submissions for ${ROLES[filterRole]}`}
          </h3>
          <p className="text-gray-600">
            {filterRole === 'all' 
              ? 'Performance evaluations will appear here once employees submit them.' 
              : `No performance evaluations submitted for ${ROLES[filterRole]} role yet.`
            }
          </p>
          {filterRole !== 'all' && (
            <button
              onClick={() => setFilterRole('all')}
              className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all submissions
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displaySubmissions.map((submission) => {
                  const formData = submission.form_data || {};
                  const totalScore = formData.totalScore || formData.rating || 0;
                  const maxScore = formData.maxTotalScore || 100;
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {submission.employee_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {submission.employee_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ROLES[submission.role] || submission.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.form_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-semibold">
                          {totalScore}/{maxScore}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({((totalScore / maxScore) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => viewSubmissionDetails(submission)}
                          className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-900 flex items-center transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;