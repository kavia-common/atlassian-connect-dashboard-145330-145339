'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { AuthPanel } from '@/components/auth';
import ProjectsList from '@/components/ProjectsList';
import { useAuth } from '@/hooks/useAuth';
import { ServiceType, AuthMethod, APITokenRequest, ProjectItem } from '@/types';

// PUBLIC_INTERFACE
export default function Home() {
  /**
   * Main dashboard page component that orchestrates the entire application layout.
   * Manages sidebar navigation, connection states, and content switching between Jira and Confluence.
   * Now uses the new authentication system with proper hooks and components.
   */

  const [activeSection, setActiveSection] = useState<ServiceType>('jira');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    login, 
    logout, 
    serviceStates, 
    isAuthenticated, 
    sessionInfo, 
    clearError 
  } = useAuth();

  const handleConnect = async (method: AuthMethod, credentials?: APITokenRequest) => {
    try {
      clearError();
      const success = await login(activeSection, method, credentials);
      
      if (success && method === 'oauth') {
        // OAuth will redirect, so we don't need to do anything else here
        return;
      }
      
      if (!success) {
        console.error(`Failed to connect to ${activeSection}`);
      }
    } catch (error) {
      console.error(`Authentication error for ${activeSection}:`, error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentServiceState = serviceStates[activeSection];
  
  // Convert the data to ProjectItem interface for the component
  const currentData: ProjectItem[] = activeSection === 'jira' 
    ? (currentServiceState.projects || []).map(project => ({
        id: project.id,
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey,
        description: project.description,
        url: project.url
      }))
    : (currentServiceState.spaces || []).map(space => ({
        id: space.id,
        key: space.key,
        name: space.name,
        type: space.type,
        description: typeof space.description === 'string' ? space.description : null
      }));

  const getSectionTitle = () => {
    const serviceName = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
    return currentServiceState.connected ? `${serviceName} Dashboard` : `Connect to ${serviceName}`;
  };

  const getSectionSubtitle = () => {
    if (currentServiceState.connected) {
      const itemType = activeSection === 'jira' ? 'projects' : 'spaces';
      return `Manage your ${activeSection} ${itemType} and resources`;
    }
    return `Connect your ${activeSection} account to get started`;
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="main-content">
        <DashboardHeader 
          title={getSectionTitle()}
          subtitle={getSectionSubtitle()}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* User Session Info */}
        {isAuthenticated && sessionInfo && (
          <div className="session-info bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Authenticated as {sessionInfo.email}
                  </p>
                  <p className="text-xs text-green-700">
                    Provider: {sessionInfo.provider} • Method: {sessionInfo.auth_method}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-green-700 hover:text-green-900 underline"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        
        {!currentServiceState.connected ? (
          <AuthPanel
            service={activeSection}
            onAuthenticate={handleConnect}
            loading={currentServiceState.loading}
            error={currentServiceState.error}
          />
        ) : (
          <ProjectsList
            service={activeSection}
            projects={currentData}
            loading={currentServiceState.loading}
          />
        )}
      </main>
    </div>
  );
}
