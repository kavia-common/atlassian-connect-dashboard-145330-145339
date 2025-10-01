'use client';

import React, { useState } from 'react';
import OAuthAuth from './OAuthAuth';
import APITokenAuth from './APITokenAuth';
import { ServiceType, AuthMethod, APITokenRequest } from '@/types';

interface AuthPanelProps {
  service: ServiceType;
  onAuthenticate: (method: AuthMethod, credentials?: APITokenRequest) => void;
  loading?: boolean;
  error?: string | null;
}

// PUBLIC_INTERFACE
/**
 * Main authentication panel component that provides both OAuth and API token authentication options
 * Allows users to choose between OAuth 2.0 and API token authentication methods
 */
export default function AuthPanel({ service, onAuthenticate, loading = false, error }: AuthPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('oauth');
  const serviceName = service.charAt(0).toUpperCase() + service.slice(1);

  const handleOAuthAuthenticate = () => {
    onAuthenticate('oauth');
  };

  const handleAPITokenAuthenticate = (credentials: APITokenRequest) => {
    onAuthenticate('api-token', credentials);
  };

  return (
    <div className="auth-panel">
      <div className="auth-panel-header mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Connect to {serviceName}
        </h2>
        <p className="text-gray-600">
          Choose your preferred authentication method to connect your {serviceName} account 
          and access your projects and resources.
        </p>
      </div>

      {/* Authentication Method Selector */}
      <div className="auth-method-selector mb-6">
        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setSelectedMethod('oauth')}
            className={`auth-method-tab ${selectedMethod === 'oauth' ? 'active' : ''}`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              OAuth 2.0
            </div>
            {selectedMethod === 'oauth' && (
              <div className="text-xs text-center mt-1 opacity-75">Recommended</div>
            )}
          </button>

          <button
            onClick={() => setSelectedMethod('api-token')}
            className={`auth-method-tab ${selectedMethod === 'api-token' ? 'active' : ''}`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              API Token
            </div>
            {selectedMethod === 'api-token' && (
              <div className="text-xs text-center mt-1 opacity-75">Direct Access</div>
            )}
          </button>
        </div>
      </div>

      {/* Authentication Method Content */}
      <div className="auth-method-content">
        {selectedMethod === 'oauth' ? (
          <OAuthAuth
            service={service}
            onAuthenticate={handleOAuthAuthenticate}
            loading={loading}
            error={error}
          />
        ) : (
          <APITokenAuth
            service={service}
            onAuthenticate={handleAPITokenAuthenticate}
            loading={loading}
            error={error}
          />
        )}
      </div>

      {/* Comparison Table */}
      <div className="auth-comparison mt-8">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Authentication Methods Comparison</h4>
        <div className="comparison-table bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="comparison-header font-medium text-gray-900"></div>
            <div className="comparison-header font-medium text-blue-900 text-center">OAuth 2.0</div>
            <div className="comparison-header font-medium text-amber-900 text-center">API Token</div>

            <div className="comparison-row-label text-gray-700">Security</div>
            <div className="comparison-cell text-center text-green-600">★★★★★</div>
            <div className="comparison-cell text-center text-yellow-600">★★★★☆</div>

            <div className="comparison-row-label text-gray-700">Setup Complexity</div>
            <div className="comparison-cell text-center text-green-600">Easy</div>
            <div className="comparison-cell text-center text-yellow-600">Moderate</div>

            <div className="comparison-row-label text-gray-700">Token Management</div>
            <div className="comparison-cell text-center text-green-600">Automatic</div>
            <div className="comparison-cell text-center text-yellow-600">Manual</div>

            <div className="comparison-row-label text-gray-700">Best For</div>
            <div className="comparison-cell text-center text-gray-600">Most users</div>
            <div className="comparison-cell text-center text-gray-600">Automation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
