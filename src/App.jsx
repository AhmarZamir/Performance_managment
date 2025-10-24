import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Components/Common/Layout';
import ProtectedRoute from './Components/Common/ProtectedRoute';

// Admin Components
import AdminDashboard from './Components/Admin/Dashboard';
import TeamManagement from './Components/Admin/TeamManagement';
import FormTemplates from './Components/Admin/FormTemplates';
import Submissions from './Components/Admin/Submissions';
import PortalLinks from './Components/Admin/PortalLinks';

// Employee Components
import EmployeePortal from './Components/Employee/EmployeePortal';

// Styles
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes with Layout */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="templates" element={<FormTemplates />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="portal-links" element={<PortalLinks />} />
                <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Employee Portal Routes - Each role has its own endpoint */}
        <Route path="/employee/principal-consultant" element={<EmployeePortal role="principal-consultant" />} />
        <Route path="/employee/senior-consultant" element={<EmployeePortal role="senior-consultant" />} />
        <Route path="/employee/consultant" element={<EmployeePortal role="consultant" />} />
        <Route path="/employee/senior-bi-developer" element={<EmployeePortal role="senior-bi-developer" />} />
        <Route path="/employee/bi-developer" element={<EmployeePortal role="bi-developer" />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* 404 fallback */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <a 
                href="/admin/dashboard" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;