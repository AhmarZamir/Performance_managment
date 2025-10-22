import React, { useState, useEffect } from 'react';
import { templateService, ROLES } from '../../services/dataService';
import { Edit, Save, X, Plus, Trash2, FileText } from 'lucide-react';

const FormTemplates = () => {
  const [templates, setTemplates] = useState({});
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    role: '',
    criteria: []
  });
  const [newCriterion, setNewCriterion] = useState({
    criteria: '',
    description: '',
    maxMarks: 10
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const data = templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleEditTemplate = (templateId) => {
    setEditingTemplate(templateId);
  };

  const handleSaveTemplate = () => {
    setEditingTemplate(null);
    alert('Template changes saved successfully!');
  };

  const updateCriterion = (templateId, criterionId, field, value) => {
    try {
      const updatedTemplates = { ...templates };
      const template = updatedTemplates[templateId];
      
      if (template && template.criteria) {
        const criterionIndex = template.criteria.findIndex(c => c.id === criterionId);
        if (criterionIndex !== -1) {
          template.criteria[criterionIndex] = { 
            ...template.criteria[criterionIndex], 
            [field]: value 
          };
          localStorage.setItem('performance_form_templates', JSON.stringify(updatedTemplates));
          setTemplates(updatedTemplates);
        }
      }
    } catch (error) {
      console.error('Error updating criterion:', error);
      alert('Error updating criterion: ' + error.message);
    }
  };

  const addCriterion = (templateId) => {
    if (!newCriterion.criteria.trim() || !newCriterion.description.trim()) {
      alert('Please fill in criteria and description');
      return;
    }

    try {
      const updatedTemplates = { ...templates };
      const template = updatedTemplates[templateId];
      
      if (template) {
        const newCriterionObj = {
          ...newCriterion,
          id: Date.now().toString()
        };
        
        template.criteria.push(newCriterionObj);
        localStorage.setItem('performance_form_templates', JSON.stringify(updatedTemplates));
        setTemplates(updatedTemplates);
        setNewCriterion({ criteria: '', description: '', maxMarks: 10 });
      }
    } catch (error) {
      console.error('Error adding criterion:', error);
      alert('Error adding criterion: ' + error.message);
    }
  };

  const deleteCriterion = (templateId, criterionId) => {
    const template = templates[templateId];
    if (template.criteria.length <= 1) {
      alert('Cannot delete the last criterion');
      return;
    }

    if (confirm('Are you sure you want to delete this criterion?')) {
      try {
        const updatedTemplates = { ...templates };
        const template = updatedTemplates[templateId];
        
        if (template) {
          template.criteria = template.criteria.filter(c => c.id !== criterionId);
          localStorage.setItem('performance_form_templates', JSON.stringify(updatedTemplates));
          setTemplates(updatedTemplates);
        }
      } catch (error) {
        console.error('Error deleting criterion:', error);
        alert('Error deleting criterion: ' + error.message);
      }
    }
  };

  const handleCreateTemplate = () => {
    setIsAdding(true);
    setNewTemplate({
      name: '',
      role: '',
      criteria: []
    });
  };

  const handleSaveNewTemplate = () => {
    if (!newTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!newTemplate.role) {
      alert('Please select a role for this template');
      return;
    }

    try {
      const newTemplateId = 'template-' + Date.now();
      
      const templateData = {
        id: newTemplateId,
        name: newTemplate.name,
        role: newTemplate.role,
        criteria: newTemplate.criteria
      };
      
      templateService.createTemplate(templateData);
      loadTemplates(); // Reload templates
      setIsAdding(false);
      setNewTemplate({ name: '', role: '', criteria: [] });
      alert('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template: ' + error.message);
    }
  };

  const addCriterionToNewTemplate = () => {
    if (!newCriterion.criteria.trim() || !newCriterion.description.trim()) {
      alert('Please fill in criteria and description');
      return;
    }

    const newCriterionObj = {
      ...newCriterion,
      id: Date.now().toString()
    };
    
    setNewTemplate(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriterionObj]
    }));
    setNewCriterion({ criteria: '', description: '', maxMarks: 10 });
  };

  const deleteCriterionFromNewTemplate = (criterionId) => {
    setNewTemplate(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== criterionId)
    }));
  };

  const deleteTemplate = (templateId) => {
    if (Object.keys(templates).length <= 1) {
      alert('Cannot delete the last template');
      return;
    }

    if (confirm('Are you sure you want to delete this template?')) {
      try {
        templateService.deleteTemplate(templateId);
        loadTemplates();
        alert('Template deleted successfully!');
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Error deleting template: ' + error.message);
      }
    }
  };

  const updateTemplateRole = (templateId, newRole) => {
    try {
      templateService.updateTemplate(templateId, { role: newRole });
      loadTemplates();
    } catch (error) {
      console.error('Error updating template role:', error);
      alert('Error updating template role: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Templates</h2>
          <p className="text-gray-600 mt-1">Create and manage evaluation form templates</p>
        </div>
        <div className="flex space-x-3">
          {editingTemplate && (
            <>
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          )}
          {!editingTemplate && !isAdding && (
            <button
              onClick={handleCreateTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </button>
          )}
        </div>
      </div>

      {/* Create New Template Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-lg border animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Template</h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTemplate({ name: '', role: '', criteria: [] });
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Role *
              </label>
              <select
                value={newTemplate.role}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a role</option>
                {Object.entries(ROLES).map(([roleKey, roleName]) => (
                  <option key={roleKey} value={roleKey}>{roleName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Criteria to New Template */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Add Criteria</h4>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criteria</label>
                <input
                  type="text"
                  value={newCriterion.criteria}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, criteria: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., Technical Skills"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newCriterion.description}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., Depth of knowledge in relevant technologies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={newCriterion.maxMarks}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <button
              onClick={addCriterionToNewTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Criteria
            </button>
          </div>

          {/* Show Added Criteria */}
          {newTemplate.criteria.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Added Criteria ({newTemplate.criteria.length})</h4>
              <div className="space-y-2">
                {newTemplate.criteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{criterion.criteria}</div>
                      <div className="text-sm text-gray-500">{criterion.description}</div>
                      <div className="text-sm text-gray-700">Max Marks: {criterion.maxMarks}</div>
                    </div>
                    <button
                      onClick={() => deleteCriterionFromNewTemplate(criterion.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTemplate({ name: '', role: '', criteria: [] });
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewTemplate}
              disabled={!newTemplate.name.trim() || !newTemplate.role || newTemplate.criteria.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Template
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-6">
        {Object.values(templates).map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-600">
                    {template.criteria?.length || 0} evaluation criteria
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {ROLES[template.role] || template.role || 'No Role Assigned'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {!editingTemplate && !isAdding && (
                  <>
                    <button
                      onClick={() => handleEditTemplate(template.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Role Assignment (when not editing criteria) */}
            {!editingTemplate && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign to Role
                </label>
                <select
                  value={template.role || ''}
                  onChange={(e) => updateTemplateRole(template.id, e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role</option>
                  {Object.entries(ROLES).map(([roleKey, roleName]) => (
                    <option key={roleKey} value={roleKey}>{roleName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This template will only be accessible to employees with the selected role
                </p>
              </div>
            )}

            {/* Criteria Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criteria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Marks
                    </th>
                    {editingTemplate === template.id && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {template.criteria?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTemplate === template.id ? (
                          <input
                            type="text"
                            value={item.criteria}
                            onChange={(e) => updateCriterion(template.id, item.id, 'criteria', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{item.criteria}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingTemplate === template.id ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateCriterion(template.id, item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">{item.description}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTemplate === template.id ? (
                          <input
                            type="number"
                            value={item.maxMarks}
                            onChange={(e) => updateCriterion(template.id, item.id, 'maxMarks', parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{item.maxMarks}</span>
                        )}
                      </td>
                      {editingTemplate === template.id && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteCriterion(template.id, item.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Criterion When Editing */}
            {editingTemplate === template.id && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Criterion</h4>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-3">
                  <div>
                    <input
                      type="text"
                      value={newCriterion.criteria}
                      onChange={(e) => setNewCriterion(prev => ({ ...prev, criteria: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Criteria name"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <input
                      type="text"
                      value={newCriterion.description}
                      onChange={(e) => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={newCriterion.maxMarks}
                      onChange={(e) => setNewCriterion(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Max marks"
                    />
                  </div>
                </div>
                <button
                  onClick={() => addCriterion(template.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criterion
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(templates).length === 0 && !isAdding && (
        <div className="bg-white p-12 rounded-lg border text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">Create your first template to get started.</p>
          <button onClick={handleCreateTemplate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      )}
    </div>
  );
};

export default FormTemplates;