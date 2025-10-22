export const backupService = {
  exportData() {
    const team = localStorage.getItem('performance_team_members');
    const submissions = localStorage.getItem('performance_submissions');
    const templates = localStorage.getItem('performance_form_templates');
    
    const data = {
      team: JSON.parse(team),
      submissions: JSON.parse(submissions),
      templates: JSON.parse(templates),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.setItem('performance_team_members', JSON.stringify(data.team));
          localStorage.setItem('performance_submissions', JSON.stringify(data.submissions));
          localStorage.setItem('performance_form_templates', JSON.stringify(data.templates));
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
};