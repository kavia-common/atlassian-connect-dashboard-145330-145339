'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ServiceType, APITokenRequest } from '@/types';

// Validation schema
const apiTokenSchema = z.object({
  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9-]+\.atlassian\.net$/, 'Domain must be in format: your-domain.atlassian.net'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  apiToken: z.string()
    .min(1, 'API Token is required')
    .min(10, 'API Token must be at least 10 characters'),
});

type APITokenFormData = z.infer<typeof apiTokenSchema>;

interface APITokenAuthProps {
  service: ServiceType;
  onAuthenticate: (credentials: APITokenRequest) => void;
  loading?: boolean;
  error?: string | null;
}

// PUBLIC_INTERFACE
/**
 * API Token authentication component for Jira and Confluence
 * Provides form-based authentication using API tokens with validation
 */
export default function APITokenAuth({ service, onAuthenticate, loading = false, error }: APITokenAuthProps) {
  const serviceName = service.charAt(0).toUpperCase() + service.slice(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<APITokenFormData>({
    resolver: zodResolver(apiTokenSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: APITokenFormData) => {
    onAuthenticate({
      domain: data.domain,
      email: data.email,
      apiToken: data.apiToken,
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="api-token-auth-container">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">API Token Authentication</h3>
      </div>

      <div className="api-token-content">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Use your {serviceName} API token for direct access. This method is ideal for 
            automated workflows and personal use.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-amber-900 mb-2">How to get your API token:</h4>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Go to your Atlassian account settings</li>
              <li>Navigate to Security → API tokens</li>
              <li>Create a new API token</li>
              <li>Copy the token and paste it below</li>
            </ol>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Authentication Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="domain">
              {serviceName} Domain *
            </label>
            <input
              id="domain"
              type="text"
              placeholder="your-domain.atlassian.net"
              className={`form-input ${errors.domain ? 'error' : ''}`}
              {...register('domain')}
              disabled={loading}
            />
            {errors.domain && (
              <p className="form-error">{errors.domain.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email')}
              disabled={loading}
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="apiToken">
              API Token *
            </label>
            <input
              id="apiToken"
              type="password"
              placeholder="Your API token"
              className={`form-input ${errors.apiToken ? 'error' : ''}`}
              {...register('apiToken')}
              disabled={loading}
            />
            {errors.apiToken && (
              <p className="form-error">{errors.apiToken.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Keep your API token secure and never share it with others
            </p>
          </div>

          <div className="form-actions space-y-3">
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`btn btn-secondary w-full flex items-center justify-center ${
                loading ? 'loading' : ''
              } ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Connect with API Token
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="btn btn-outline w-full"
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Your credentials are transmitted securely and are not stored by this application.
          </p>
        </div>
      </div>
    </div>
  );
}
