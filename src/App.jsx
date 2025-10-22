import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './Components/Admin/Dashboard';
import EmployeePortal from './Components/Employee/EmployeePortal';
import Layout from './Components/Common/Layout';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Admin Route */}
          <Route path="/admin" element={
            <Layout>
              <AdminDashboard />
            </Layout>
          } />
          
          {/* Employee Role-based Routes */}
          <Route path="/employee/senior-consultant" element={
            <EmployeePortal role="senior-consultant" />
          } />
          <Route path="/employee/consultant" element={
            <EmployeePortal role="consultant" />
          } />
          <Route path="/employee/junior-consultant" element={
            <EmployeePortal role="junior-consultant" />
          } />
          <Route path="/employee/manager" element={
            <EmployeePortal role="manager" />
          } />
          
          {/* Default redirect to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;