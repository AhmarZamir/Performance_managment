// src/services/jsonServerService.js
const API_URL = 'http://localhost:3001';

// Team/Employee Service
export const teamService = {
  getEmployees: () => 
    fetch(`${API_URL}/employees`).then(res => res.json()),

  getEmployee: (id) => 
    fetch(`${API_URL}/employees/${id}`).then(res => res.json()),

  addEmployee: (employee) => 
    fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...employee,
        id: Date.now(),
        createdAt: new Date().toISOString()
      })
    }).then(res => res.json()),

  updateEmployee: (id, updates) => 
    fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(res => res.json()),

  deleteEmployee: (id) => 
    fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE'
    })
};

// Template Service
export const templateService = {
  getTemplates: () => 
    fetch(`${API_URL}/templates`).then(res => res.json()),

  getTemplate: (id) => 
    fetch(`${API_URL}/templates/${id}`).then(res => res.json()),

  createTemplate: (template) => 
    fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...template,
        id: Date.now(),
        createdAt: new Date().toISOString()
      })
    }).then(res => res.json()),

  updateTemplate: (id, updates) => 
    fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(res => res.json()),

  deleteTemplate: (id) => 
    fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE'
    })
};

// Submission Service
export const submissionService = {
  getSubmissions: () => 
    fetch(`${API_URL}/submissions`).then(res => res.json()),

  getSubmission: (id) => 
    fetch(`${API_URL}/submissions/${id}`).then(res => res.json()),

  submitForm: (submissionData) => 
    fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...submissionData,
        id: Date.now(),
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      })
    }).then(res => res.json()),

  updateSubmission: (id, updates) => 
    fetch(`${API_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(res => res.json()),

  deleteSubmission: (id) => 
    fetch(`${API_URL}/submissions/${id}`, {
      method: 'DELETE'
    })
};