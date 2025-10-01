'use client';

import React from 'react';
import Image from 'next/image';
import { JiraProject } from '@/types';

interface JiraProjectsProps {
  projects: JiraProject[];
  loading: boolean;
  error?: string | null;
  cloudId?: string | null;
  onRetry?: () => void;
  onClearError?: () => void;
}

// PUBLIC_INTERFACE
export default function JiraProjects({ projects, loading, error, cloudId, onRetry, onClearError }: JiraProjectsProps) {
  /**
   * Component for displaying Jira projects with comprehensive state handling.
   * Shows project cards with key information, avatars, and external links.
   * Handles loading, error, and empty states gracefully.
   */

  if (loading) {
    return (
      <div className="data-container">
        <div className="data-header">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse mr-3"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        
        <div className="data-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="data-card animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="flex space-x-2">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-container">
        <div className="error-state">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Failed to Load Projects
          </h3>
          <p className="text-gray-600 text-center max-w-md mx-auto">
            {error || 'Unable to fetch Jira projects. Please check your connection and try again.'}
          </p>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                onClearError?.();
                onRetry ? onRetry() : window.location.reload();
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="data-container">
        <div className="empty-state">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            No Projects Found
          </h3>
          <p className="text-gray-600 text-center max-w-md mx-auto">
            No Jira projects are available in your account. Contact your administrator or create a new project to get started.
          </p>
          <div className="mt-6 text-center">
            <a
              href={cloudId ? `https://id.atlassian.com/manage-profile/profile-and-visibility` : `https://atlassian.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Jira
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-container">
      <div className="data-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V4.35A2.35 2.35 0 0019.65 2H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V9.15a2.35 2.35 0 00-2.35-2.35H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V13.95A2.35 2.35 0 0010.13 11.6H2z"/>
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Jira Projects</h3>
              <p className="text-sm text-gray-600 mt-1">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} available
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected
          </div>
        </div>
      </div>

      <div className="data-grid">
        {projects.map((project) => (
          <div key={project.id} className="data-card group hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start flex-1">
                {project.avatarUrls?.['48x48'] && (
                  <Image
                    src={project.avatarUrls['48x48']}
                    alt={`${project.name} avatar`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg mr-3 flex-shrink-0"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                      {project.key}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {project.projectTypeKey?.replace(/([A-Z])/g, ' $1').trim() || 'Project'}
                    </span>
                    {project.isPrivate && (
                      <span className="text-xs text-amber-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {project.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {project.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span>ID: {project.id}</span>
                {project.projectCategory && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      {(() => {
                        if (project.projectCategory && 
                            typeof project.projectCategory === 'object' && 
                            'name' in project.projectCategory && 
                            typeof project.projectCategory.name === 'string') {
                          return project.projectCategory.name;
                        }
                        return 'Uncategorized';
                      })()}
                    </span>
                  </>
                )}
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <span>View in Jira</span>
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
