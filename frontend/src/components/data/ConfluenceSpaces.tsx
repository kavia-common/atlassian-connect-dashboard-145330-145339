'use client';

import React from 'react';
import { ConfluenceSpace } from '@/types';

interface ConfluenceSpacesProps {
  spaces: ConfluenceSpace[];
  loading: boolean;
  error?: string | null;
  cloudId?: string | null;
}

// PUBLIC_INTERFACE
export default function ConfluenceSpaces({ spaces, loading, error, cloudId }: ConfluenceSpacesProps) {
  /**
   * Component for displaying Confluence spaces with comprehensive state handling.
   * Shows space cards with key information, status indicators, and external links.
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
            Failed to Load Spaces
          </h3>
          <p className="text-gray-600 text-center max-w-md mx-auto">
            {error || 'Unable to fetch Confluence spaces. Please check your connection and try again.'}
          </p>
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
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

  if (spaces.length === 0) {
    return (
      <div className="data-container">
        <div className="empty-state">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            No Spaces Found
          </h3>
          <p className="text-gray-600 text-center max-w-md mx-auto">
            No Confluence spaces are available in your account. Contact your administrator or create a new space to get started.
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
              Visit Confluence
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getSpaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'global':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
        );
      case 'personal':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'current':
        return 'text-green-600 bg-green-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="data-container">
      <div className="data-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.33 11.32a.75.75 0 01.36.96c-.87 1.83-1.56 3.75-2.06 5.75a.75.75 0 01-1.46-.38c.54-2.13 1.28-4.18 2.2-6.13a.75.75 0 01.96-.36l.75.16zm9.34 1.36a.75.75 0 01-.36-.96c.87-1.83 1.56-3.75 2.06-5.75a.75.75 0 011.46.38c-.54 2.13-1.28 4.18-2.2 6.13a.75.75 0 01-.96.36l-.75-.16zM12 4.5c4.14 0 7.5 3.36 7.5 7.5s-3.36 7.5-7.5 7.5S4.5 16.14 4.5 12 7.86 4.5 12 4.5z"/>
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confluence Spaces</h3>
              <p className="text-sm text-gray-600 mt-1">
                {spaces.length} {spaces.length === 1 ? 'space' : 'spaces'} available
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
        {spaces.map((space) => (
          <div key={space.id} className="data-card group hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {space.name}
                </h4>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                    {space.key}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getStatusColor(space.status)}`}>
                    {getSpaceTypeIcon(space.type)}
                    <span className="ml-1 capitalize">{space.type}</span>
                  </span>
                  {space.status && space.status !== 'current' && (
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(space.status)}`}>
                      {space.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {(() => {
              if (space.description && 
                  typeof space.description === 'object' && 
                  'plain' in space.description && 
                  space.description.plain && 
                  typeof space.description.plain === 'object' &&
                  'value' in space.description.plain) {
                return (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {String(space.description.plain.value)}
                  </p>
                );
              }
              return null;
            })()}
            
            {space.homepage && (
              <div className="flex items-center text-xs text-gray-500 mb-4">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 5a1 1 0 01-1 1H8a1 1 0 110-2h4a1 1 0 011 1zm-1 3a1 1 0 100 2H8a1 1 0 100-2h4z" clipRule="evenodd" />
                </svg>
                <span>Has homepage</span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span>ID: {space.id}</span>
                {space.metadata && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Metadata available</span>
                  </>
                )}
              </div>
              {space._links?.webui && (
                <a
                  href={space._links.webui}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <span>View in Confluence</span>
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
