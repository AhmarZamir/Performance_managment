import React, { useState, useEffect } from 'react';
import { templateService, submissionService } from '../../services/dataService';
import { CheckCircle, AlertCircle, Star, Target } from 'lucide-react';

const PerformanceForm = ({ employee }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    employeeName: employee.name,
    employeeEmail: employee.email,
    templateId: '',
    evaluations: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load templates for the employee's role
  useEffect(() => {
    loadTemplates();
  }, [employee.role]);

  const loadTemplates = () => {
    try {
      const roleTemplates = templateService.getTemplatesByRole(employee.role);
      setTemplates(roleTemplates);
      
      // Set default template
      if (roleTemplates.length > 0) {
        const firstTemplate = roleTemplates[0];
        setSelectedTemplateId(firstTemplate.id);
        initializeFormWithTemplate(firstTemplate);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const initializeFormWithTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      evaluations: template.criteria.map(criteria => ({
        criteriaId: criteria.id,
        criteria: criteria.criteria,
        description: criteria.description,
        maxMarks: criteria.maxMarks,
        selfScore: '',
        selfComment: ''
      }))
    }));
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      initializeFormWithTemplate(template);
    }
  };

  // ... rest of the existing PerformanceForm code remains the same
  // [Keep all the existing handleScoreChange, handleCommentChange, calculateProgress, handleSubmit functions]

  const handleScoreChange = (criteriaId, value) => {
    const evaluation = formData.evaluations.find(e => e.criteriaId === criteriaId);
    const maxScore = evaluation?.maxMarks || 0;
    
    if (value === '' || (Number(value) >= 0 && Number(value) <= maxScore)) {
      setFormData(prev => ({
        ...prev,
        evaluations: prev.evaluations.map(evalItem =>
          evalItem.criteriaId === criteriaId
            ? { ...evalItem, selfScore: value }
            : evalItem
        )
      }));
    }
  };

  const handleCommentChange = (criteriaId, value) => {
    setFormData(prev => ({
      ...prev,
      evaluations: prev.evaluations.map(evalItem =>
        evalItem.criteriaId === criteriaId
          ? { ...evalItem, selfComment: value }
          : evalItem
      )
    }));
  };

  const calculateProgress = () => {
    const totalFields = formData.evaluations.length * 2;
    const filledFields = formData.evaluations.reduce((count, evalItem) => {
      return count + (evalItem.selfScore ? 1 : 0) + (evalItem.selfComment ? 1 : 0);
    }, 0);
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const totalScore = formData.evaluations.reduce((sum, evalItem) => 
      sum + (Number(evalItem.selfScore) || 0), 0
    );
    
    const maxTotalScore = formData.evaluations.reduce((sum, evalItem) => 
      sum + (evalItem.maxMarks || 0), 0
    );

    const submission = {
      ...formData,
      formType: templates.find(t => t.id === selectedTemplateId)?.name || 'Performance Review',
      totalScore,
      maxTotalScore
    };

    try {
      await submissionService.submitEvaluation(submission);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Error submitting evaluation: ' + error.message);
      setIsSubmitting(false);
    }
  };

  const progress = calculateProgress();

  if (isSubmitted) {
    return (
      <div className="bg-white p-12 rounded-lg border text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Evaluation Submitted Successfully!</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Thank you for completing your {templates.find(t => t.id === selectedTemplateId)?.name}.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
              initializeFormWithTemplate(template);
            }
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Start New Evaluation
        </button>
      </div>
    );
  }

  const template = templates.find(t => t.id === selectedTemplateId);

  if (!template) {
    return (
      <div className="bg-white p-8 rounded-lg border text-center">
        <div className="text-gray-500">No evaluation forms available for your role.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg border animate-slide-up">
      {/* Form Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Target className="h-8 w-8 text-blue-600" />
          <h3 className="text-3xl font-bold text-gray-900">{template.name}</h3>
        </div>
        <p className="text-gray-600">
          Role-specific evaluation form for {employee.position || template.role}
        </p>
      </div>

      {/* Template Selection */}
      {templates.length > 1 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Select Evaluation Form
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-700">Completion Progress</span>
          <span className="text-sm font-bold text-blue-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Employee Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Name</label>
            <input
              type="text"
              value={formData.employeeName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100/80"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.employeeEmail}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100/80"
            />
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Star className="h-6 w-6 text-blue-600" />
            <h4 className="text-2xl font-bold text-gray-900">Self Evaluation Criteria</h4>
          </div>
          
          {formData.evaluations.map((evaluation) => {
            const score = Number(evaluation.selfScore || 0);
            const percentage = evaluation.maxMarks > 0 ? (score / evaluation.maxMarks) * 100 : 0;

            return (
              <div key={evaluation.criteriaId} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Criteria</label>
                    <input
                      type="text"
                      value={evaluation.criteria}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={evaluation.description}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Score (Max: {evaluation.maxMarks})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={evaluation.maxMarks}
                      value={evaluation.selfScore}
                      onChange={(e) => handleScoreChange(evaluation.criteriaId, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {evaluation.selfScore && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-blue-500' :
                              percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Self Evaluation Comments
                  </label>
                  <textarea
                    value={evaluation.selfComment}
                    onChange={(e) => handleCommentChange(evaluation.criteriaId, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Share your achievements, challenges, and areas for improvement..."
                    required
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Section */}
        <div className="bg-white p-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Ready to submit your evaluation?</p>
                <p className="text-sm text-gray-600">
                  Please review all sections before submission.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || progress < 100}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Evaluation
                </>
              )}
            </button>
          </div>
          {progress < 100 && (
            <p className="text-sm text-orange-600 mt-3 text-center">
              Please complete all fields (scores and comments) before submitting.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PerformanceForm;