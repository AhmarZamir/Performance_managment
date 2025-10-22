export let formTemplates = {
  'senior-consultant': {
    id: 'senior-consultant',
    name: 'Senior Consultant Performance Review',
    criteria: [
      {
        id: 1,
        criteria: 'Technical Expertise',
        description: 'Depth of knowledge in relevant technologies and frameworks',
        maxMarks: 20
      },
      {
        id: 2,
        criteria: 'Client Management',
        description: 'Ability to manage client relationships and expectations',
        maxMarks: 20
      },
      {
        id: 3,
        criteria: 'Project Delivery',
        description: 'Quality and timeliness of project deliverables',
        maxMarks: 25
      },
      {
        id: 4,
        criteria: 'Team Collaboration',
        description: 'Effectiveness in working with team members',
        maxMarks: 20
      },
      {
        id: 5,
        criteria: 'Innovation & Initiative',
        description: 'Proactive approach to problem-solving and innovation',
        maxMarks: 15
      }
    ]
  }
};

// Allow modifications by exporting as let
export const employees = [
  { id: 1, name: 'John Doe', email: 'john@company.com', role: 'senior-consultant' },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'senior-consultant' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'senior-consultant' }
];

export let submissions = [];