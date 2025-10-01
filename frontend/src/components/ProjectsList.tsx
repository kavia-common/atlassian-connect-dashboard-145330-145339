'use client';

import React from 'react';
import { ServiceType, ProjectItem } from '@/types';

interface ProjectsListProps {
  service: ServiceType;
  projects: ProjectItem[];
  loading?: boolean;
}

// PUBLIC_INTERFACE
export default function ProjectsList({ service, projects, loading = false }: ProjectsListProps) {
  /**
   * Projects list component for displaying Jira projects or Confluence spaces.
   * Shows project cards with key information and handles loading states.
   */

  const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
  const itemName = service === 'jira' ? 'Projects' : 'Spaces';

  if (loading) {
    return (
      <div className="panel">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading {itemName.toLowerCase()}...</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="panel">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8-4m8 4v18m0-18L8 7v18m16 0v18l-8-4m8 4l-8-4m-8 4l8-4v-18m0 18L8 25l8-4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {itemName} Found</h3>
          <p className="text-gray-600">
            No {itemName.toLowerCase()} are available in your {serviceName} account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {serviceName} {itemName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {projects.length} {itemName.toLowerCase()} available
          </p>
        </div>
        <div className="flex items-center text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Connected
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {project.key}
                  </span>
                  {(project.projectTypeKey || project.type) && (
                    <span className="text-xs text-gray-500">
                      {project.projectTypeKey || project.type}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {project.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {project.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                ID: {project.id}
              </span>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View in {serviceName}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
