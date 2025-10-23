import React, { useState, useEffect } from 'react';
import { teamService, templateService, submissionService } from '../../services/supabaseService'
import { Download, Eye, Trash2 } from 'lucide-react';

// Define ROLES locally if not available
const ROLES = {
  manager: 'Manager',
  team_lead: 'Team Lead',
  employee: 'Employee',
  hr: 'HR Manager',
  admin: 'Administrator'
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
      alert('Error loading submissions. Please check if JSON Server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions by role
  const filteredSubmissions = filterRole === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.role === filterRole);

  const exportToExcel = () => {
    try {
      const dataToExport = filterRole === 'all' ? submissions : filteredSubmissions;
      
      if (dataToExport.length === 0) {
        alert('No submissions to export');
        return;
      }

      // Create CSV content
      const headers = ['Employee Name', 'Email', 'Role', 'Form Type', 'Total Score', 'Max Score', 'Submission Date'];
      
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(sub => {
          const role = sub.role || 'Unknown Role';
          const formData = sub.formData || {};
          const totalScore = formData.totalScore || formData.rating || 0;
          const maxScore = formData.maxTotalScore || 100;
          
          return [
            `"${sub.employeeName || sub.employeeId}"`,
            `"${sub.employeeEmail || 'N/A'}"`,
            `"${ROLES[role] || role}"`,
            `"${sub.formType || 'Performance Review'}"`,
            totalScore,
            maxScore,
            `"${new Date(sub.submittedAt || sub.submissionDate).toLocaleDateString()}"`
          ].join(',');
        })
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `performance-submissions-${filterRole === 'all' ? 'all' : filterRole}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${dataToExport.length} submissions successfully!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data: ' + error.message);
    }
  };

  const deleteSubmission = async (submissionId) => {
    if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        await submissionService.deleteSubmission(submissionId);
        await loadSubmissions();
        setSelectedSubmission(null);
        
        // Refresh dashboard stats
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
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </button>
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Employee Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedSubmission.employeeName || selectedSubmission.employeeId}</p>
                    <p><span className="font-medium">Email:</span> {selectedSubmission.employeeEmail || 'N/A'}</p>
                    <p><span className="font-medium">Form Type:</span> {selectedSubmission.formType || 'Performance Review'}</p>
                    <p><span className="font-medium">Role:</span> {ROLES[selectedSubmission.role] || selectedSubmission.role || 'Unknown'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Evaluation Summary</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Score:</span> 
                      {selectedSubmission.formData?.totalScore || selectedSubmission.formData?.rating || 0}/
                      {selectedSubmission.formData?.maxTotalScore || 100}
                    </p>
                    <p><span className="font-medium">Percentage:</span> 
                      {(((selectedSubmission.formData?.totalScore || selectedSubmission.formData?.rating || 0) / 
                        (selectedSubmission.formData?.maxTotalScore || 100)) * 100).toFixed(1)}%
                    </p>
                    <p><span className="font-medium">Submitted:</span> 
                      {new Date(selectedSubmission.submittedAt || selectedSubmission.submissionDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {selectedSubmission.formData?.evaluations && selectedSubmission.formData.evaluations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4">Detailed Evaluation</h4>
                  <div className="space-y-4">
                    {selectedSubmission.formData.evaluations.map((evalItem, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="font-medium text-gray-700">Criteria</p>
                            <p className="text-gray-900">{evalItem.criteria}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Score</p>
                            <p className="text-gray-900">{evalItem.selfScore || evalItem.score}/{evalItem.maxMarks}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Percentage</p>
                            <p className="text-gray-900">
                              {(((evalItem.selfScore || evalItem.score) / evalItem.maxMarks) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Comments</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded">
                            {evalItem.selfComment || evalItem.comments || 'No comments provided'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.formData && !selectedSubmission.formData.evaluations && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4">Form Data</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedSubmission.formData, null, 2)}
                    </pre>
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
      
      {displaySubmissions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
                  const role = submission.role || 'Unknown Role';
                  const formData = submission.formData || {};
                  const totalScore = formData.totalScore || formData.rating || 0;
                  const maxScore = formData.maxTotalScore || 100;
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.employeeName || submission.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.employeeEmail || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ROLES[role] || role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.formType || 'Performance Review'}
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
                        {new Date(submission.submittedAt || submission.submissionDate).toLocaleDateString()}
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