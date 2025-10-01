'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ConnectionPanel from '@/components/ConnectionPanel';
import ProjectsList from '@/components/ProjectsList';
import { ServiceType, AuthMethod, APITokenRequest, ConnectionData, JiraProject, ConfluenceSpace, ProjectItem } from '@/types';

// PUBLIC_INTERFACE
export default function Home() {
  /**
   * Main dashboard page component that orchestrates the entire application layout.
   * Manages sidebar navigation, connection states, and content switching between Jira and Confluence.
   */

  const [activeSection, setActiveSection] = useState<ServiceType>('jira');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connections, setConnections] = useState<ConnectionData>({
    jira: { connected: false, projects: [], loading: false },
    confluence: { connected: false, spaces: [], loading: false },
  });

  const handleConnect = async (service: ServiceType, method: AuthMethod, data?: APITokenRequest) => {
    setConnections(prev => ({
      ...prev,
      [service]: { ...prev[service], loading: true }
    }));

    try {
      // TODO: Implement actual API calls to backend
      console.log(`Connecting to ${service} via ${method}`, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection with sample data
      const mockJiraProjects: JiraProject[] = [
        { id: '1', key: 'PROJ', name: 'Sample Project', projectTypeKey: 'software', description: 'A sample Jira project' },
        { id: '2', key: 'TEST', name: 'Test Project', projectTypeKey: 'business', description: 'Test project for demonstration' }
      ];

      const mockConfluenceSpaces: ConfluenceSpace[] = [
        { id: '1', key: 'SPACE', name: 'Sample Space', type: 'global', description: null },
        { id: '2', key: 'DOCS', name: 'Documentation', type: 'global', description: null }
      ];

      const mockData = service === 'jira' 
        ? {
            connected: true,
            projects: mockJiraProjects,
            loading: false
          }
        : {
            connected: true,
            spaces: mockConfluenceSpaces,
            loading: false
          };

      setConnections(prev => ({
        ...prev,
        [service]: mockData
      }));
    } catch (error) {
      console.error(`Failed to connect to ${service}:`, error);
      setConnections(prev => ({
        ...prev,
        [service]: { ...prev[service], loading: false }
      }));
    }
  };

  const currentConnection = connections[activeSection];
  
  // Convert the data to ProjectItem interface for the component
  const currentData: ProjectItem[] = activeSection === 'jira' 
    ? (currentConnection.projects || []).map(project => ({
        id: project.id,
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey,
        description: project.description,
        url: project.url
      }))
    : (currentConnection.spaces || []).map(space => ({
        id: space.id,
        key: space.key,
        name: space.name,
        type: space.type,
        description: typeof space.description === 'string' ? space.description : null
      }));

  const getSectionTitle = () => {
    const serviceName = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
    return currentConnection.connected ? `${serviceName} Dashboard` : `Connect to ${serviceName}`;
  };

  const getSectionSubtitle = () => {
    if (currentConnection.connected) {
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
        
        {!currentConnection.connected ? (
          <ConnectionPanel
            service={activeSection}
            isConnected={currentConnection.connected}
            onConnect={(method, data) => handleConnect(activeSection, method, data)}
            loading={currentConnection.loading}
          />
        ) : (
          <ProjectsList
            service={activeSection}
            projects={currentData}
            loading={currentConnection.loading}
          />
        )}
      </main>
    </div>
  );
}
