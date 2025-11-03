import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/supabaseService';

const EmployeeLogin = ({ onLoginSuccess, onBackToAdmin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authData = await authService.verifyEmployeeCredentials(
        credentials.username, 
        credentials.password
      );
      
      if (authData && authData.employees) {
        onLoginSuccess(authData.employees);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/optronix_ai_logo.jpg" 
              alt="Optronix AI Logo"
              className="h-26 w-36 object-cover rounded"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Employee Portal Login</h2>
          <p className="mt-2 text-gray-600">
            Enter your credentials to access your performance evaluation
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg border shadow-sm" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="relative block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Portal
                </>
              )}
            </button>
        
          

          
          
          </div>
        </form>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure employee portal. Your evaluation data is protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;