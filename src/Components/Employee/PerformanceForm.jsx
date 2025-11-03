import React, { useState, useEffect } from 'react';
import { teamService, templateService, submissionService } from '../../services/supabaseService'
import { CheckCircle, AlertCircle, Star, Target } from 'lucide-react';

const PerformanceForm = ({ employee, roleTemplates = [] }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    employeeName: employee.name,
    employeeEmail: employee.email,
    employeeId: employee.id,
    role: employee.role,
    templateId: '',
    formType: '',
    formData: {
      evaluations: []
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (roleTemplates.length > 0) {
      setTemplates(roleTemplates);
      // Set default template
      const firstTemplate = roleTemplates[0];
      if (firstTemplate) {
        setSelectedTemplateId(firstTemplate.id);
        initializeFormWithTemplate(firstTemplate);
      }
    }
  }, [roleTemplates]);

  const initializeFormWithTemplate = (template) => {
    const templateCriteria = Array.isArray(template.criteria) ? template.criteria : [];
    
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      formType: template.name,
      role: employee.role,
      formData: {
        evaluations: templateCriteria.map(criteria => ({
          criteriaId: criteria.id,
          criteria: criteria.criteria,
          description: criteria.description,
          maxMarks: criteria.maxMarks,
          selfScore: '',
          selfComment: ''
        }))
      }
    }));
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      initializeFormWithTemplate(template);
    }
  };

  const handleScoreChange = (criteriaId, value) => {
    const evaluation = formData.formData.evaluations.find(e => e.criteriaId === criteriaId);
    const maxScore = evaluation?.maxMarks || 0;
    
    if (value === '' || (Number(value) >= 0 && Number(value) <= maxScore)) {
      setFormData(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          evaluations: prev.formData.evaluations.map(evalItem =>
            evalItem.criteriaId === criteriaId
              ? { ...evalItem, selfScore: value }
              : evalItem
          )
        }
      }));
    }
  };

  const handleCommentChange = (criteriaId, value) => {
    setFormData(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        evaluations: prev.formData.evaluations.map(evalItem =>
          evalItem.criteriaId === criteriaId
            ? { ...evalItem, selfComment: value }
            : evalItem
        )
      }
    }));
  };

  const calculateProgress = () => {
    const evaluations = formData.formData.evaluations || [];
    const totalFields = evaluations.length * 2;
    const filledFields = evaluations.reduce((count, evalItem) => {
      return count + (evalItem.selfScore ? 1 : 0) + (evalItem.selfComment ? 1 : 0);
    }, 0);
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const evaluations = formData.formData.evaluations || [];
      const totalScore = evaluations.reduce((sum, evalItem) => 
        sum + (Number(evalItem.selfScore) || 0), 0
      );
      
      const maxTotalScore = evaluations.reduce((sum, evalItem) => 
        sum + (evalItem.maxMarks || 0), 0
      );

      const submission = {
        employeeName: formData.employeeName,
        employeeEmail: formData.employeeEmail,
        employeeId: formData.employeeId,
        role: formData.role,
        templateId: formData.templateId,
        formType: formData.formType,
        formData: {
          ...formData.formData,
          totalScore,
          maxTotalScore,
          submittedAt: new Date().toISOString()
        },
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      await submissionService.submitForm(submission);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Error submitting evaluation: ' + error.message);
      setIsSubmitting(false);
    }
  };

  const progress = calculateProgress();
  const template = templates.find(t => t.id === selectedTemplateId);

  if (isSubmitted) {
    return (
      <div className="bg-white p-12 rounded-lg border text-center animate-fade-in shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Evaluation Submitted Successfully!</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Thank you for completing your {template?.name}.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            if (template) {
              initializeFormWithTemplate(template);
            }
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Evaluation
        </button>
      </div>
    );
  }

  if (!template || templates.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Evaluation Forms Available</h3>
        <p className="text-gray-600">
          There are no evaluation forms configured for the {employee.role} role yet.
        </p>
      </div>
    );
  }

  const evaluations = formData.formData.evaluations || [];

  return (
    <div className="bg-white p-8 rounded-lg border animate-slide-up shadow-sm">
      {/* Form Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Target className="h-8 w-8 text-blue-600" />
          <h3 className="text-3xl font-bold text-gray-900">{template.name}</h3>
        </div>
        <p className="text-gray-600">
          Role-specific evaluation form for {employee.position || employee.role}
        </p>
      </div>

      {/* Template Selection */}
      {templates.length > 1 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Select Evaluation Form
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
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
        <p className="text-xs text-blue-600 mt-2">
          {progress < 100 ? 'Complete all scores and comments to submit' : 'Ready to submit!'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Employee Info */}
        
            
       
                {/* Evaluation Criteria */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Star className="h-6 w-6 text-blue-600" />
            <h4 className="text-2xl font-bold text-gray-900">Self Evaluation Criteria</h4>
          </div>
          
          {evaluations.map((evaluation) => {
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80 font-medium transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={evaluation.description}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/80 transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {percentage.toFixed(1)}% of maximum
                        </p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors w-full lg:w-auto"
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