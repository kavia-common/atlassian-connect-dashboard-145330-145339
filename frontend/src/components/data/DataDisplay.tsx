'use client';

import React, { useEffect } from 'react';
import { ServiceType } from '@/types';
import { useData } from '@/contexts/DataContext';
import JiraProjects from './JiraProjects';
import ConfluenceSpaces from './ConfluenceSpaces';

interface ServiceConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
}

interface DataDisplayProps {
  activeService: ServiceType;
  serviceStates: {
    jira: ServiceConnectionState;
    confluence: ServiceConnectionState;
  };
  cloudId?: string | null;
}

// PUBLIC_INTERFACE
export default function DataDisplay({ activeService, serviceStates, cloudId }: DataDisplayProps) {
  /**
   * Dynamic data display component that switches between Jira projects and Confluence spaces
   * based on the active service selection. Uses the data context for state management and
   * automatically fetches data when service is connected.
   */

  const {
    jira,
    confluence,
    fetchJiraProjects,
    fetchConfluenceSpaces,
    clearJiraError,
    clearConfluenceError,
  } = useData();

  const currentServiceState = serviceStates[activeService];

  // Auto-fetch data when service becomes connected
  useEffect(() => {
    if (currentServiceState.connected) {
      if (activeService === 'jira' && (!jira.projects.length || jira.error)) {
        fetchJiraProjects(cloudId || undefined, false);
      } else if (activeService === 'confluence' && (!confluence.spaces.length || confluence.error)) {
        fetchConfluenceSpaces(cloudId || undefined, false);
      }
    }
  }, [
    activeService,
    currentServiceState.connected,
    cloudId,
    jira.projects.length,
    jira.error,
    confluence.spaces.length,
    confluence.error,
    fetchJiraProjects,
    fetchConfluenceSpaces,
  ]);

  // Check if the user is connected to the current service
  if (!currentServiceState.connected) {
    return (
      <div className="data-container">
        <div className="empty-state">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Not Connected
          </h3>
          <p className="text-gray-600 text-center max-w-md mx-auto">
            Please authenticate with {activeService.charAt(0).toUpperCase() + activeService.slice(1)} to view your data.
          </p>
        </div>
      </div>
    );
  }

  // Render the appropriate data display component based on active service
  switch (activeService) {
    case 'jira':
      return (
        <JiraProjects
          projects={jira.projects}
          loading={jira.loading}
          error={jira.error}
          cloudId={jira.cloudId || cloudId}
          onRetry={() => fetchJiraProjects(cloudId || undefined, true)}
          onClearError={clearJiraError}
        />
      );
    
    case 'confluence':
      return (
        <ConfluenceSpaces
          spaces={confluence.spaces}
          loading={confluence.loading}
          error={confluence.error}
          cloudId={confluence.cloudId || cloudId}
          onRetry={() => fetchConfluenceSpaces(cloudId || undefined, true)}
          onClearError={clearConfluenceError}
        />
      );
    
    default:
      return (
        <div className="data-container">
          <div className="error-state">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Unknown Service
            </h3>
            <p className="text-gray-600 text-center max-w-md mx-auto">
              The selected service &ldquo;{activeService}&rdquo; is not supported.
            </p>
          </div>
        </div>
      );
  }
}
