// Keys for localStorage
const STORAGE_KEYS = {
  TEAM_MEMBERS: 'performance_team_members',
  SUBMISSIONS: 'performance_submissions',
  FORM_TEMPLATES: 'performance_form_templates'
};

// Role definitions
export const ROLES = {
  'senior-consultant': 'Senior Consultant',
  'consultant': 'Consultant', 
  'junior-consultant': 'Junior Consultant',
  'manager': 'Manager'
};

// Initialize default data with role-based templates
const initializeDefaultData = () => {
  // Default team members
  if (!localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)) {
    const defaultTeam = [
      {
        id: '1',
        name: 'Ahmar',
        email: 'ahmar@company.com',
        role: 'senior-consultant',
        department: 'Technology',
        position: 'Senior Consultant',
        join_date: '2024-01-15'
      },
      {
        id: '2',
        name: 'Daniyal',
        email: 'daniyal@company.com',
        role: 'consultant',
        department: 'Consulting',
        position: 'Consultant',
        join_date: '2024-02-20'
      },
      {
        id: '3',
        name: 'Faisal',
        email: 'faisal@company.com',
        role: 'junior-consultant',
        department: 'Technology',
        position: 'Junior Consultant',
        join_date: '2024-01-10'
      },
      {
        id: '4',
        name: 'Sarah Manager',
        email: 'sarah@company.com',
        role: 'manager',
        department: 'Management',
        position: 'Project Manager',
        join_date: '2023-11-15'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(defaultTeam));
  }

  // Default submissions
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
  }

  // Default form templates for each role
  if (!localStorage.getItem(STORAGE_KEYS.FORM_TEMPLATES)) {
    const defaultTemplates = {
      'senior-consultant-template': {
        id: 'senior-consultant-template',
        name: 'Senior Consultant Performance Review',
        role: 'senior-consultant',
        criteria: [
          {
            id: '1',
            criteria: 'Technical Leadership',
            description: 'Ability to lead technical initiatives and mentor junior team members',
            maxMarks: 25
          },
          {
            id: '2',
            criteria: 'Client Strategy',
            description: 'Strategic thinking in client engagements and solution architecture',
            maxMarks: 25
          },
          {
            id: '3',
            criteria: 'Project Delivery',
            description: 'Quality and timeliness of complex project deliverables',
            maxMarks: 30
          },
          {
            id: '4',
            criteria: 'Team Collaboration',
            description: 'Effectiveness in leading and collaborating with team members',
            maxMarks: 20
          }
        ]
      },
      'consultant-template': {
        id: 'consultant-template',
        name: 'Consultant Performance Review',
        role: 'consultant',
        criteria: [
          {
            id: '1',
            criteria: 'Technical Expertise',
            description: 'Depth of knowledge in relevant technologies and frameworks',
            maxMarks: 25
          },
          {
            id: '2',
            criteria: 'Client Management',
            description: 'Ability to manage client relationships and expectations',
            maxMarks: 25
          },
          {
            id: '3',
            criteria: 'Project Execution',
            description: 'Quality and timeliness of project deliverables',
            maxMarks: 30
          },
          {
            id: '4',
            criteria: 'Team Collaboration',
            description: 'Effectiveness in working with team members',
            maxMarks: 20
          }
        ]
      },
      'junior-consultant-template': {
        id: 'junior-consultant-template',
        name: 'Junior Consultant Performance Review',
        role: 'junior-consultant',
        criteria: [
          {
            id: '1',
            criteria: 'Learning & Development',
            description: 'Progress in learning new technologies and skills',
            maxMarks: 30
          },
          {
            id: '2',
            criteria: 'Task Execution',
            description: 'Quality and timeliness of assigned tasks',
            maxMarks: 25
          },
          {
            id: '3',
            criteria: 'Teamwork',
            description: 'Ability to work effectively within the team',
            maxMarks: 25
          },
          {
            id: '4',
            criteria: 'Communication',
            description: 'Effectiveness in communicating progress and challenges',
            maxMarks: 20
          }
        ]
      },
      'manager-template': {
        id: 'manager-template',
        name: 'Manager Performance Review',
        role: 'manager',
        criteria: [
          {
            id: '1',
            criteria: 'Team Leadership',
            description: 'Effectiveness in leading and motivating the team',
            maxMarks: 30
          },
          {
            id: '2',
            criteria: 'Strategic Planning',
            description: 'Ability to develop and execute strategic plans',
            maxMarks: 25
          },
          {
            id: '3',
            criteria: 'Resource Management',
            description: 'Efficient management of team resources and budgets',
            maxMarks: 25
          },
          {
            id: '4',
            criteria: 'Stakeholder Management',
            description: 'Effectiveness in managing stakeholder relationships',
            maxMarks: 20
          }
        ]
      }
    };
    localStorage.setItem(STORAGE_KEYS.FORM_TEMPLATES, JSON.stringify(defaultTemplates));
  }
};

// Initialize immediately
initializeDefaultData();

// Team Members Service
export const teamService = {
  getTeamMembers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  },

  // In submissionService object, add:
getTemplateForSubmission(submission) {
  const templates = templateService.getTemplates();
  return templates[submission.templateId] || {};
},

  getTeamMembersByRole(role) {
    const members = this.getTeamMembers();
    return members.filter(member => member.role === role);
  },

  addTeamMember(member) {
    try {
      const members = this.getTeamMembers();
      const newMember = {
        ...member,
        id: Date.now().toString()
      };
      members.push(newMember);
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  updateTeamMember(id, updates) {
    try {
      const members = this.getTeamMembers();
      const index = members.findIndex(m => m.id === id);
      if (index !== -1) {
        members[index] = { ...members[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
        return members[index];
      }
      throw new Error('Team member not found');
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  deleteTeamMember(id) {
    try {
      const members = this.getTeamMembers();
      const filtered = members.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  }
};

// Form Templates Service
export const templateService = {
  getTemplates() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FORM_TEMPLATES);
      return JSON.parse(stored) || {};
    } catch (error) {
      console.error('Error getting templates:', error);
      return {};
    }
  },

  getTemplatesByRole(role) {
    const templates = this.getTemplates();
    return Object.values(templates).filter(template => template.role === role);
  },

  getTemplateById(templateId) {
    const templates = this.getTemplates();
    return templates[templateId];
  },

  createTemplate(templateData) {
    try {
      const templates = this.getTemplates();
      const newTemplateId = 'template-' + Date.now();
      
      templates[newTemplateId] = {
        id: newTemplateId,
        ...templateData
      };
      
      localStorage.setItem(STORAGE_KEYS.FORM_TEMPLATES, JSON.stringify(templates));
      return templates[newTemplateId];
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  updateTemplate(templateId, updates) {
    try {
      const templates = this.getTemplates();
      if (templates[templateId]) {
        templates[templateId] = { ...templates[templateId], ...updates };
        localStorage.setItem(STORAGE_KEYS.FORM_TEMPLATES, JSON.stringify(templates));
        return templates[templateId];
      }
      throw new Error('Template not found');
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  deleteTemplate(templateId) {
    try {
      const templates = this.getTemplates();
      delete templates[templateId];
      localStorage.setItem(STORAGE_KEYS.FORM_TEMPLATES, JSON.stringify(templates));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
};

// Submissions Service
export const submissionService = {
  getSubmissions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  },

  getSubmissionsByRole(role) {
    const submissions = this.getSubmissions();
    return submissions.filter(submission => {
      const template = templateService.getTemplateById(submission.templateId);
      return template && template.role === role;
    });
  },

  submitEvaluation(submissionData) {
    try {
      const submissions = this.getSubmissions();
      const newSubmission = {
        id: Date.now().toString(),
        ...submissionData,
        submissionDate: new Date().toISOString()
      };
      
      submissions.push(newSubmission);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
      return newSubmission;
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      throw error;
    }
  },

  deleteSubmission(submissionId) {
    try {
      const submissions = this.getSubmissions();
      const filtered = submissions.filter(sub => sub.id !== submissionId);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filtered));
      return filtered;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
};

