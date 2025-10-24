import React, { useState } from 'react';
import { Copy, Share2, Shield, Check } from 'lucide-react';

// Define ROLES locally since we're not using dataService anymore
const ROLES = {
  'principal-consultant': 'Principal Consultant',
  'senior-consultant': 'Senior Consultant',
  'consultant': 'Consultant',
  'senior-bi-developer': 'Senior BI Developer',
  'bi-developer': 'BI Developer'
};






const PortalLinks = () => {
  const [copiedRole, setCopiedRole] = useState(null);

  const getPortalUrl = (role) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/employee/${role}`;
  };

  const copyToClipboard = async (role) => {
    try {
      await navigator.clipboard.writeText(getPortalUrl(role));
      setCopiedRole(role);
      setTimeout(() => setCopiedRole(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getPortalUrl(role);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedRole(role);
      setTimeout(() => setCopiedRole(null), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center mb-6">
        <Share2 className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-900">Employee Portal Links</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Share these secure links with your team members. Each role has its own dedicated portal URL.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(ROLES).map(([roleKey, roleName]) => (
          <div key={roleKey} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-gray-900">{roleName}</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Secure Portal
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={getPortalUrl(roleKey)}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                onClick={() => copyToClipboard(roleKey)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {copiedRole === roleKey ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Share this link with {roleName} team members only
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Security Features</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Role-based access control</li>
          <li>• Employees can only see colleagues in their same role</li>
          <li>• Role-specific evaluation forms</li>
          <li>• Secure, dedicated URLs for each role</li>
        </ul>
      </div>
    </div>
  );
};

export default PortalLinks;