'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { apiClient, APIError } from '@/services/api';
import { 
  ServiceType, 
  JiraProject, 
  ConfluenceSpace,
  JiraProjectsResponse,
  ConfluenceSpacesResponse,
  ResourceInfo 
} from '@/types';

// ============= TYPES =============

interface DataState {
  jira: {
    projects: JiraProject[];
    selectedProject: JiraProject | null;
    loading: boolean;
    error: string | null;
    lastFetch: Date | null;
    cloudId: string | null;
  };
  confluence: {
    spaces: ConfluenceSpace[];
    selectedSpace: ConfluenceSpace | null;
    loading: boolean;
    error: string | null;
    lastFetch: Date | null;
    cloudId: string | null;
  };
  resources: {
    jira: ResourceInfo[];
    confluence: ResourceInfo[];
    loading: boolean;
    error: string | null;
  };
}

interface DataContextType extends DataState {
  // Jira methods
  fetchJiraProjects: (cloudId?: string, forceRefresh?: boolean) => Promise<JiraProjectsResponse | null>;
  selectJiraProject: (project: JiraProject | null) => void;
  getJiraProjectDetails: (projectKey: string, cloudId?: string) => Promise<Record<string, unknown>>;
  clearJiraError: () => void;
  
  // Confluence methods
  fetchConfluenceSpaces: (cloudId?: string, forceRefresh?: boolean) => Promise<ConfluenceSpacesResponse | null>;
  selectConfluenceSpace: (space: ConfluenceSpace | null) => void;
  getConfluenceSpaceDetails: (spaceKey: string, cloudId?: string) => Promise<Record<string, unknown>>;
  getConfluenceSpaceContent: (spaceKey: string, contentType?: string, cloudId?: string) => Promise<Record<string, unknown>>;
  clearConfluenceError: () => void;
  
  // Resource methods
  fetchResources: (service: ServiceType) => Promise<void>;
  clearResourcesError: () => void;
  
  // General methods
  clearAllErrors: () => void;
  refreshAllData: () => Promise<void>;
}

// ============= ACTION TYPES =============

type DataAction =
  // Jira actions
  | { type: 'SET_JIRA_LOADING'; payload: boolean }
  | { type: 'SET_JIRA_ERROR'; payload: string | null }
  | { type: 'SET_JIRA_PROJECTS'; payload: { projects: JiraProject[]; cloudId?: string | null } }
  | { type: 'SELECT_JIRA_PROJECT'; payload: JiraProject | null }
  
  // Confluence actions
  | { type: 'SET_CONFLUENCE_LOADING'; payload: boolean }
  | { type: 'SET_CONFLUENCE_ERROR'; payload: string | null }
  | { type: 'SET_CONFLUENCE_SPACES'; payload: { spaces: ConfluenceSpace[]; cloudId?: string | null } }
  | { type: 'SELECT_CONFLUENCE_SPACE'; payload: ConfluenceSpace | null }
  
  // Resources actions
  | { type: 'SET_RESOURCES_LOADING'; payload: boolean }
  | { type: 'SET_RESOURCES_ERROR'; payload: string | null }
  | { type: 'SET_RESOURCES'; payload: { service: ServiceType; resources: ResourceInfo[] } }
  
  // General actions
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'RESET_STATE' };

// ============= INITIAL STATE =============

const initialState: DataState = {
  jira: {
    projects: [],
    selectedProject: null,
    loading: false,
    error: null,
    lastFetch: null,
    cloudId: null,
  },
  confluence: {
    spaces: [],
    selectedSpace: null,
    loading: false,
    error: null,
    lastFetch: null,
    cloudId: null,
  },
  resources: {
    jira: [],
    confluence: [],
    loading: false,
    error: null,
  },
};

// ============= REDUCER =============

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    // Jira cases
    case 'SET_JIRA_LOADING':
      return {
        ...state,
        jira: {
          ...state.jira,
          loading: action.payload,
        },
      };

    case 'SET_JIRA_ERROR':
      return {
        ...state,
        jira: {
          ...state.jira,
          error: action.payload,
          loading: false,
        },
      };

    case 'SET_JIRA_PROJECTS':
      return {
        ...state,
        jira: {
          ...state.jira,
          projects: action.payload.projects,
          cloudId: action.payload.cloudId || null,
          loading: false,
          error: null,
          lastFetch: new Date(),
        },
      };

    case 'SELECT_JIRA_PROJECT':
      return {
        ...state,
        jira: {
          ...state.jira,
          selectedProject: action.payload,
        },
      };

    // Confluence cases
    case 'SET_CONFLUENCE_LOADING':
      return {
        ...state,
        confluence: {
          ...state.confluence,
          loading: action.payload,
        },
      };

    case 'SET_CONFLUENCE_ERROR':
      return {
        ...state,
        confluence: {
          ...state.confluence,
          error: action.payload,
          loading: false,
        },
      };

    case 'SET_CONFLUENCE_SPACES':
      return {
        ...state,
        confluence: {
          ...state.confluence,
          spaces: action.payload.spaces,
          cloudId: action.payload.cloudId || null,
          loading: false,
          error: null,
          lastFetch: new Date(),
        },
      };

    case 'SELECT_CONFLUENCE_SPACE':
      return {
        ...state,
        confluence: {
          ...state.confluence,
          selectedSpace: action.payload,
        },
      };

    // Resources cases
    case 'SET_RESOURCES_LOADING':
      return {
        ...state,
        resources: {
          ...state.resources,
          loading: action.payload,
        },
      };

    case 'SET_RESOURCES_ERROR':
      return {
        ...state,
        resources: {
          ...state.resources,
          error: action.payload,
          loading: false,
        },
      };

    case 'SET_RESOURCES':
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.service]: action.payload.resources,
          loading: false,
          error: null,
        },
      };

    // General cases
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        jira: { ...state.jira, error: null },
        confluence: { ...state.confluence, error: null },
        resources: { ...state.resources, error: null },
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// ============= CONTEXT =============

const DataContext = createContext<DataContextType | undefined>(undefined);

// ============= PROVIDER COMPONENT =============

interface DataProviderProps {
  children: ReactNode;
}

// PUBLIC_INTERFACE
/**
 * Data provider component that manages global application data state
 * Provides data fetching methods, caching, and state management for Jira and Confluence
 */
export function DataProvider({ children }: DataProviderProps) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // ============= JIRA METHODS =============

  // PUBLIC_INTERFACE
  /**
   * Fetch Jira projects with optional caching
   * @param cloudId Optional cloud ID for OAuth authentication
   * @param forceRefresh Whether to force refresh even if data exists
   * @returns Promise resolving to projects response or null if failed
   */
  const fetchJiraProjects = useCallback(async (
    cloudId?: string, 
    forceRefresh: boolean = false
  ): Promise<JiraProjectsResponse | null> => {
    // Skip if already loading
    if (state.jira.loading) return null;
    
    // Check if we have recent data and not forcing refresh
    if (!forceRefresh && state.jira.lastFetch && state.jira.projects.length > 0) {
      const timeSinceLastFetch = Date.now() - state.jira.lastFetch.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      if (timeSinceLastFetch < fiveMinutes) {
        return { 
          success: true, 
          projects: state.jira.projects, 
          total_count: state.jira.projects.length,
          cloud_id: state.jira.cloudId 
        };
      }
    }

    try {
      dispatch({ type: 'SET_JIRA_LOADING', payload: true });
      const response = await apiClient.getJiraProjects(cloudId);
      
      dispatch({ 
        type: 'SET_JIRA_PROJECTS', 
        payload: { 
          projects: response.projects, 
          cloudId: response.cloud_id 
        } 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'Failed to fetch Jira projects';
      
      console.error('Failed to fetch Jira projects:', error);
      dispatch({ type: 'SET_JIRA_ERROR', payload: errorMessage });
      return null;
    }
  }, [state.jira.loading, state.jira.lastFetch, state.jira.projects.length, state.jira.cloudId]);

  // PUBLIC_INTERFACE
  /**
   * Select a Jira project
   * @param project Project to select or null to deselect
   */
  const selectJiraProject = useCallback((project: JiraProject | null): void => {
    dispatch({ type: 'SELECT_JIRA_PROJECT', payload: project });
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Get detailed information about a Jira project
   * @param projectKey Project key or ID
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise resolving to project details
   */
  const getJiraProjectDetails = useCallback(async (
    projectKey: string, 
    cloudId?: string
  ): Promise<Record<string, unknown>> => {
    try {
      return await apiClient.getJiraProjectDetails(projectKey, cloudId);
    } catch (error) {
      console.error('Failed to get Jira project details:', error);
      throw error;
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Clear Jira error state
   */
  const clearJiraError = useCallback((): void => {
    dispatch({ type: 'SET_JIRA_ERROR', payload: null });
  }, []);

  // ============= CONFLUENCE METHODS =============

  // PUBLIC_INTERFACE
  /**
   * Fetch Confluence spaces with optional caching
   * @param cloudId Optional cloud ID for OAuth authentication
   * @param forceRefresh Whether to force refresh even if data exists
   * @returns Promise resolving to spaces response or null if failed
   */
  const fetchConfluenceSpaces = useCallback(async (
    cloudId?: string, 
    forceRefresh: boolean = false
  ): Promise<ConfluenceSpacesResponse | null> => {
    // Skip if already loading
    if (state.confluence.loading) return null;
    
    // Check if we have recent data and not forcing refresh
    if (!forceRefresh && state.confluence.lastFetch && state.confluence.spaces.length > 0) {
      const timeSinceLastFetch = Date.now() - state.confluence.lastFetch.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      if (timeSinceLastFetch < fiveMinutes) {
        return { 
          success: true, 
          spaces: state.confluence.spaces, 
          total_count: state.confluence.spaces.length,
          cloud_id: state.confluence.cloudId 
        };
      }
    }

    try {
      dispatch({ type: 'SET_CONFLUENCE_LOADING', payload: true });
      const response = await apiClient.getConfluenceSpaces(cloudId);
      
      dispatch({ 
        type: 'SET_CONFLUENCE_SPACES', 
        payload: { 
          spaces: response.spaces, 
          cloudId: response.cloud_id 
        } 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'Failed to fetch Confluence spaces';
      
      console.error('Failed to fetch Confluence spaces:', error);
      dispatch({ type: 'SET_CONFLUENCE_ERROR', payload: errorMessage });
      return null;
    }
  }, [state.confluence.loading, state.confluence.lastFetch, state.confluence.spaces.length, state.confluence.cloudId]);

  // PUBLIC_INTERFACE
  /**
   * Select a Confluence space
   * @param space Space to select or null to deselect
   */
  const selectConfluenceSpace = useCallback((space: ConfluenceSpace | null): void => {
    dispatch({ type: 'SELECT_CONFLUENCE_SPACE', payload: space });
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Get detailed information about a Confluence space
   * @param spaceKey Space key
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise resolving to space details
   */
  const getConfluenceSpaceDetails = useCallback(async (
    spaceKey: string, 
    cloudId?: string
  ): Promise<Record<string, unknown>> => {
    try {
      return await apiClient.getConfluenceSpaceDetails(spaceKey, cloudId);
    } catch (error) {
      console.error('Failed to get Confluence space details:', error);
      throw error;
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Get content from a Confluence space
   * @param spaceKey Space key
   * @param contentType Type of content ('page' or 'blogpost')
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise resolving to space content
   */
  const getConfluenceSpaceContent = useCallback(async (
    spaceKey: string, 
    contentType: string = 'page', 
    cloudId?: string
  ): Promise<Record<string, unknown>> => {
    try {
      return await apiClient.getConfluenceSpaceContent(spaceKey, contentType, cloudId);
    } catch (error) {
      console.error('Failed to get Confluence space content:', error);
      throw error;
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Clear Confluence error state
   */
  const clearConfluenceError = useCallback((): void => {
    dispatch({ type: 'SET_CONFLUENCE_ERROR', payload: null });
  }, []);

  // ============= RESOURCES METHODS =============

  // PUBLIC_INTERFACE
  /**
   * Fetch accessible resources for a service
   * @param service Service to fetch resources for
   */
  const fetchResources = useCallback(async (service: ServiceType): Promise<void> => {
    try {
      dispatch({ type: 'SET_RESOURCES_LOADING', payload: true });
      
      const response = service === 'jira' 
        ? await apiClient.getJiraResources()
        : await apiClient.getConfluenceResources();
      
      dispatch({ 
        type: 'SET_RESOURCES', 
        payload: { service, resources: response.resources } 
      });
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : `Failed to fetch ${service} resources`;
      
      console.error(`Failed to fetch ${service} resources:`, error);
      dispatch({ type: 'SET_RESOURCES_ERROR', payload: errorMessage });
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Clear resources error state
   */
  const clearResourcesError = useCallback((): void => {
    dispatch({ type: 'SET_RESOURCES_ERROR', payload: null });
  }, []);

  // ============= GENERAL METHODS =============

  // PUBLIC_INTERFACE
  /**
   * Clear all error states
   */
  const clearAllErrors = useCallback((): void => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Refresh all data for both services
   */
  const refreshAllData = useCallback(async (): Promise<void> => {
    try {
      await Promise.allSettled([
        fetchJiraProjects(state.jira.cloudId || undefined, true),
        fetchConfluenceSpaces(state.confluence.cloudId || undefined, true),
      ]);
    } catch (error) {
      console.error('Failed to refresh all data:', error);
    }
  }, [fetchJiraProjects, fetchConfluenceSpaces, state.jira.cloudId, state.confluence.cloudId]);

  // ============= CONTEXT VALUE =============

  const contextValue: DataContextType = {
    ...state,
    // Jira methods
    fetchJiraProjects,
    selectJiraProject,
    getJiraProjectDetails,
    clearJiraError,
    // Confluence methods
    fetchConfluenceSpaces,
    selectConfluenceSpace,
    getConfluenceSpaceDetails,
    getConfluenceSpaceContent,
    clearConfluenceError,
    // Resources methods
    fetchResources,
    clearResourcesError,
    // General methods
    clearAllErrors,
    refreshAllData,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

// ============= HOOK =============

// PUBLIC_INTERFACE
/**
 * Hook to access data context
 * @returns Data context with state and methods
 * @throws Error if used outside DataProvider
 */
export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;
