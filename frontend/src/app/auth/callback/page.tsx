'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api';
import { getApiBaseUrl } from '@/utils';

// PUBLIC_INTERFACE
/**
 * OAuth callback page that handles the OAuth authentication flow completion
 * Processes the authorization code and completes the authentication
 */
export default function OAuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract OAuth parameters from URL
        const { code, state, error } = apiClient.handleOAuthCallback();
        
        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Validate state parameter
        const storedState = localStorage.getItem('oauth_state');
        const storedService = localStorage.getItem('oauth_service');
        
        if (!storedState || storedState !== state) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        if (!storedService) {
          throw new Error('Missing service information');
        }

        setMessage('Exchanging authorization code for access token...');

        // The backend will handle the OAuth callback automatically
        // We just need to call the callback endpoint with the code and state
        const callbackUrl = storedService === 'jira' 
          ? `/auth/jira/oauth/callback?code=${code}&state=${state}`
          : `/auth/confluence/oauth/callback?code=${code}&state=${state}`;

        const response = await fetch(`${getApiBaseUrl()}${callbackUrl}`);
        
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.session_id) {
          localStorage.setItem('sessionId', result.session_id);
        }

        // Clean up OAuth state
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_service');

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');

        // Redirect back to main page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        // Clean up OAuth state on error
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_service');

        // Redirect back to main page after a delay
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            OAuth Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Completing your authentication...
          </p>
        </div>
        
        <div className="callback-status">
          {status === 'processing' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">Processing...</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-green-900">Success!</p>
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-red-900">Authentication Failed</p>
                <p className="text-sm text-red-700">{message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  You will be redirected back to the dashboard shortly.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-500 underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
