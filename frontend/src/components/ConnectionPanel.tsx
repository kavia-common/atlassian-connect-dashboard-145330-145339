'use client';

import React, { useState } from 'react';

import { ServiceType, AuthMethod, APITokenRequest } from '@/types';

interface ConnectionPanelProps {
  service: ServiceType;
  isConnected: boolean;
  onConnect: (method: AuthMethod, data?: APITokenRequest) => void;
  loading?: boolean;
}

// PUBLIC_INTERFACE
export default function ConnectionPanel({ service, isConnected, onConnect, loading = false }: ConnectionPanelProps) {
  /**
   * Connection panel component for authenticating with Jira or Confluence.
   * Provides OAuth and API token authentication options with form handling.
   */

  const [selectedMethod, setSelectedMethod] = useState<'oauth' | 'api-token'>('oauth');
  const [formData, setFormData] = useState({
    domain: '',
    email: '',
    apiToken: '',
  });

  const serviceName = service.charAt(0).toUpperCase() + service.slice(1);

  const handleApiTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect('api-token', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isConnected) {
    return (
      <div className="panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {serviceName} Connected
            </h3>
          </div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
        <p className="text-gray-600 mb-4">
          Your {serviceName} account is successfully connected. You can now view your projects and spaces.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect to {serviceName}
        </h3>
        <p className="text-gray-600">
          Choose your preferred authentication method to connect your {serviceName} account.
        </p>
      </div>

      <div className="connection-options">
        {/* OAuth Option */}
        <div 
          className={`connection-card ${selectedMethod === 'oauth' ? 'selected' : ''}`}
          onClick={() => setSelectedMethod('oauth')}
        >
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">OAuth 2.0</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Secure authentication through Atlassian. Recommended for most users.
          </p>
          {selectedMethod === 'oauth' && (
            <button
              onClick={() => onConnect('oauth')}
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Connecting...' : `Connect with ${serviceName}`}
            </button>
          )}
        </div>

        {/* API Token Option */}
        <div 
          className={`connection-card ${selectedMethod === 'api-token' ? 'selected' : ''}`}
          onClick={() => setSelectedMethod('api-token')}
        >
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">API Token</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Use your personal access token for direct API access.
          </p>
        </div>
      </div>

      {/* API Token Form */}
      {selectedMethod === 'api-token' && (
        <form onSubmit={handleApiTokenSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              {serviceName} Domain
            </label>
            <input
              type="text"
              placeholder="your-domain.atlassian.net"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your-email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              API Token
            </label>
            <input
              type="password"
              placeholder="Your API token"
              value={formData.apiToken}
              onChange={(e) => handleInputChange('apiToken', e.target.value)}
              className="form-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Generate your API token from your Atlassian account settings
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-secondary w-full ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Connecting...' : 'Connect with API Token'}
          </button>
        </form>
      )}
    </div>
  );
}
