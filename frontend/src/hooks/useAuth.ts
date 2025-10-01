import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { 
  ServiceType, 
  AuthMethod, 
  APITokenRequest, 
  SessionInfo, 
  JiraProject, 
  ConfluenceSpace,
  AuthenticationResponse 
} from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  sessionInfo: SessionInfo | null;
  loading: boolean;
  error: string | null;
}

interface ServiceConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  projects?: JiraProject[];
  spaces?: ConfluenceSpace[];
}

interface AuthHookReturn extends AuthState {
  login: (service: ServiceType, method: AuthMethod, credentials?: APITokenRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  getServiceData: (service: ServiceType) => Promise<JiraProject[] | ConfluenceSpace[]>;
  serviceStates: {
    jira: ServiceConnectionState;
    confluence: ServiceConnectionState;
  };
}

// PUBLIC_INTERFACE
/**
 * Custom hook for managing authentication state and operations
 * Provides methods for login, logout, session management, and service data fetching
 */
export function useAuth(): AuthHookReturn {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    sessionInfo: null,
    loading: false,
    error: null,
  });

  const [serviceStates, setServiceStates] = useState<{
    jira: ServiceConnectionState;
    confluence: ServiceConnectionState;
  }>({
    jira: { connected: false, loading: false, error: null },
    confluence: { connected: false, loading: false, error: null },
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authService.isAuthenticated()) {
        try {
          setAuthState(prev => ({ ...prev, loading: true }));
          const sessionInfo = await authService.getSessionInfo();
          setAuthState({
            isAuthenticated: true,
            sessionInfo,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to get session info:', error);
          setAuthState({
            isAuthenticated: false,
            sessionInfo: null,
            loading: false,
            error: 'Session expired or invalid',
          });
          // Clear invalid session
          localStorage.removeItem('sessionId');
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuthStatus();
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Login with specified service and authentication method
   * @param service - Service to authenticate with (jira or confluence)
   * @param method - Authentication method (oauth or api-token)
   * @param credentials - API token credentials (required for api-token method)
   * @returns Promise resolving to boolean indicating success
   */
  const login = useCallback(async (
    service: ServiceType, 
    method: AuthMethod, 
    credentials?: APITokenRequest
  ): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      setServiceStates(prev => ({
        ...prev,
        [service]: { ...prev[service], loading: true, error: null }
      }));

      let authResponse: AuthenticationResponse;

      if (method === 'oauth') {
        // Initiate OAuth flow - this will redirect the user
        await authService.initiateOAuth(service);
        return true; // OAuth will handle the redirect
      } else if (method === 'api-token' && credentials) {
        // Authenticate with API token
        if (service === 'jira') {
          authResponse = await authService.authenticateJiraAPIToken(credentials);
        } else {
          authResponse = await authService.authenticateConfluenceAPIToken(credentials);
        }

        if (authResponse.success) {
          // Get session info after successful authentication
          const sessionInfo = await authService.getSessionInfo();
          setAuthState({
            isAuthenticated: true,
            sessionInfo,
            loading: false,
            error: null,
          });

          // Fetch service data
          await getServiceData(service);
          
          setServiceStates(prev => ({
            ...prev,
            [service]: { ...prev[service], connected: true, loading: false, error: null }
          }));

          return true;
        } else {
          throw new Error(authResponse.message || 'Authentication failed');
        }
      } else {
        throw new Error('Invalid authentication method or missing credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('Login failed:', error);
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      setServiceStates(prev => ({
        ...prev,
        [service]: { ...prev[service], loading: false, error: errorMessage }
      }));

      return false;
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Logout user and clear authentication state
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await authService.logout();
      
      setAuthState({
        isAuthenticated: false,
        sessionInfo: null,
        loading: false,
        error: null,
      });

      setServiceStates({
        jira: { connected: false, loading: false, error: null },
        confluence: { connected: false, loading: false, error: null },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout locally even if API call fails
      setAuthState({
        isAuthenticated: false,
        sessionInfo: null,
        loading: false,
        error: null,
      });
      
      setServiceStates({
        jira: { connected: false, loading: false, error: null },
        confluence: { connected: false, loading: false, error: null },
      });
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Refresh current session information
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!authService.isAuthenticated()) return;

    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const sessionInfo = await authService.getSessionInfo();
      setAuthState(prev => ({
        ...prev,
        sessionInfo,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to refresh session',
      }));
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Clear current error state
   */
  const clearError = useCallback((): void => {
    setAuthState(prev => ({ ...prev, error: null }));
    setServiceStates(prev => ({
      jira: { ...prev.jira, error: null },
      confluence: { ...prev.confluence, error: null },
    }));
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Get service-specific data (projects or spaces)
   * @param service - Service to fetch data for
   * @returns Promise resolving to array of projects or spaces
   */
  const getServiceData = useCallback(async (service: ServiceType): Promise<JiraProject[] | ConfluenceSpace[]> => {
    try {
      setServiceStates(prev => ({
        ...prev,
        [service]: { ...prev[service], loading: true, error: null }
      }));

      if (service === 'jira') {
        const response = await authService.getJiraProjects();
        setServiceStates(prev => ({
          ...prev,
          jira: { 
            ...prev.jira, 
            connected: true, 
            loading: false, 
            projects: response.projects,
            error: null 
          }
        }));
        return response.projects;
      } else {
        const response = await authService.getConfluenceSpaces();
        setServiceStates(prev => ({
          ...prev,
          confluence: { 
            ...prev.confluence, 
            connected: true, 
            loading: false, 
            spaces: response.spaces,
            error: null 
          }
        }));
        return response.spaces;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${service} data`;
      console.error(`Failed to get ${service} data:`, error);
      
      setServiceStates(prev => ({
        ...prev,
        [service]: { ...prev[service], loading: false, error: errorMessage }
      }));
      
      throw error;
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    clearError,
    getServiceData,
    serviceStates,
  };
}

export default useAuth;
