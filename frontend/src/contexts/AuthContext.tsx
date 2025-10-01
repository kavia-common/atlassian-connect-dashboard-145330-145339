'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient, APIError } from '@/services/api';
import { 
  ServiceType, 
  AuthMethod, 
  APITokenRequest, 
  SessionInfo, 
  JiraProject, 
  ConfluenceSpace 
} from '@/types';

// ============= TYPES =============

interface AuthState {
  isAuthenticated: boolean;
  sessionInfo: SessionInfo | null;
  loading: boolean;
  error: string | null;
  serviceStates: {
    jira: ServiceConnectionState;
    confluence: ServiceConnectionState;
  };
}

interface ServiceConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  projects?: JiraProject[];
  spaces?: ConfluenceSpace[];
  lastFetch?: Date;
}

interface AuthContextType extends AuthState {
  login: (service: ServiceType, method: AuthMethod, credentials?: APITokenRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  fetchServiceData: (service: ServiceType, forceRefresh?: boolean) => Promise<void>;
  clearServiceError: (service: ServiceType) => void;
}

// ============= ACTION TYPES =============

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: { authenticated: boolean; sessionInfo: SessionInfo | null } }
  | { type: 'SET_SERVICE_LOADING'; payload: { service: ServiceType; loading: boolean } }
  | { type: 'SET_SERVICE_ERROR'; payload: { service: ServiceType; error: string | null } }
  | { type: 'SET_SERVICE_CONNECTED'; payload: { service: ServiceType; connected: boolean } }
  | { type: 'SET_SERVICE_DATA'; payload: { service: ServiceType; data: JiraProject[] | ConfluenceSpace[] } }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'RESET_STATE' };

// ============= INITIAL STATE =============

const initialState: AuthState = {
  isAuthenticated: false,
  sessionInfo: null,
  loading: false,
  error: null,
  serviceStates: {
    jira: {
      connected: false,
      loading: false,
      error: null,
    },
    confluence: {
      connected: false,
      loading: false,
      error: null,
    },
  },
};

// ============= REDUCER =============

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload.authenticated,
        sessionInfo: action.payload.sessionInfo,
        loading: false,
        error: null,
      };

    case 'SET_SERVICE_LOADING':
      return {
        ...state,
        serviceStates: {
          ...state.serviceStates,
          [action.payload.service]: {
            ...state.serviceStates[action.payload.service],
            loading: action.payload.loading,
          },
        },
      };

    case 'SET_SERVICE_ERROR':
      return {
        ...state,
        serviceStates: {
          ...state.serviceStates,
          [action.payload.service]: {
            ...state.serviceStates[action.payload.service],
            error: action.payload.error,
            loading: false,
          },
        },
      };

    case 'SET_SERVICE_CONNECTED':
      return {
        ...state,
        serviceStates: {
          ...state.serviceStates,
          [action.payload.service]: {
            ...state.serviceStates[action.payload.service],
            connected: action.payload.connected,
            loading: false,
            error: action.payload.connected ? null : state.serviceStates[action.payload.service].error,
          },
        },
      };

    case 'SET_SERVICE_DATA':
      const { service, data } = action.payload;
      return {
        ...state,
        serviceStates: {
          ...state.serviceStates,
          [service]: {
            ...state.serviceStates[service],
            connected: true,
            loading: false,
            error: null,
            lastFetch: new Date(),
            ...(service === 'jira' ? { projects: data as JiraProject[] } : { spaces: data as ConfluenceSpace[] }),
          },
        },
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        error: null,
        serviceStates: {
          jira: { ...state.serviceStates.jira, error: null },
          confluence: { ...state.serviceStates.confluence, error: null },
        },
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        loading: false,
      };

    default:
      return state;
  }
}

// ============= CONTEXT =============

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============= PROVIDER COMPONENT =============

interface AuthProviderProps {
  children: ReactNode;
}

// PUBLIC_INTERFACE
/**
 * Authentication provider component that manages global auth state
 * Provides authentication methods, session management, and service data
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ============= EFFECTS =============

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ============= METHODS =============

  /**
   * Check authentication status on mount
   */
  const checkAuthStatus = async (): Promise<void> => {
    if (apiClient.isAuthenticated()) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const sessionInfo = await apiClient.getSessionInfo();
        dispatch({ 
          type: 'SET_AUTHENTICATED', 
          payload: { authenticated: true, sessionInfo } 
        });

        // Try to fetch service data for connected services
        const provider = sessionInfo.provider.toLowerCase() as ServiceType;
        if (provider === 'jira' || provider === 'confluence') {
          await fetchServiceData(provider, false);
        }
      } catch (error) {
        console.error('Failed to get session info:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Session expired or invalid. Please log in again.' 
        });
        apiClient.clearSession();
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Login with specified service and authentication method
   * @param service Service to authenticate with (jira or confluence)
   * @param method Authentication method (oauth or api-token)
   * @param credentials API token credentials (required for api-token method)
   * @returns Promise resolving to boolean indicating success
   */
  const login = async (
    service: ServiceType, 
    method: AuthMethod, 
    credentials?: APITokenRequest
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'CLEAR_ALL_ERRORS' });
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_SERVICE_LOADING', payload: { service, loading: true } });

      if (method === 'oauth') {
        // Initiate OAuth flow - this will redirect the user
        await apiClient.initiateOAuth(service);
        return true; // OAuth will handle the redirect
      } 
      
      if (method === 'api-token' && credentials) {
        // Authenticate with API token
        const authResponse = service === 'jira' 
          ? await apiClient.authenticateJiraAPIToken(credentials)
          : await apiClient.authenticateConfluenceAPIToken(credentials);

        if (authResponse.success) {
          // Get session info after successful authentication
          const sessionInfo = await apiClient.getSessionInfo();
          dispatch({ 
            type: 'SET_AUTHENTICATED', 
            payload: { authenticated: true, sessionInfo } 
          });

          // Fetch service data
          await fetchServiceData(service, true);
          
          dispatch({ 
            type: 'SET_SERVICE_CONNECTED', 
            payload: { service, connected: true } 
          });

          return true;
        } else {
          throw new Error(authResponse.message || 'Authentication failed');
        }
      } else {
        throw new Error('Invalid authentication method or missing credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'Authentication failed';
      
      console.error('Login failed:', error);
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ 
        type: 'SET_SERVICE_ERROR', 
        payload: { service, error: errorMessage } 
      });

      return false;
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Logout user and clear authentication state
   */
  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiClient.logout();
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout locally even if API call fails
      dispatch({ type: 'RESET_STATE' });
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Refresh current session information
   */
  const refreshSession = async (): Promise<void> => {
    if (!apiClient.isAuthenticated()) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionInfo = await apiClient.getSessionInfo();
      dispatch({ 
        type: 'SET_AUTHENTICATED', 
        payload: { authenticated: true, sessionInfo } 
      });
    } catch (error) {
      console.error('Failed to refresh session:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to refresh session' 
      });
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Clear all error states
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  // PUBLIC_INTERFACE
  /**
   * Clear error for specific service
   * @param service Service to clear error for
   */
  const clearServiceError = (service: ServiceType): void => {
    dispatch({ 
      type: 'SET_SERVICE_ERROR', 
      payload: { service, error: null } 
    });
  };

  // PUBLIC_INTERFACE
  /**
   * Fetch service-specific data (projects or spaces)
   * @param service Service to fetch data for
   * @param forceRefresh Whether to force refresh even if data exists
   */
  const fetchServiceData = async (service: ServiceType, forceRefresh: boolean = false): Promise<void> => {
    const serviceState = state.serviceStates[service];
    
    // Skip if already loading or if we have recent data and not forcing refresh
    if (serviceState.loading) return;
    
    if (!forceRefresh && serviceState.lastFetch) {
      const timeSinceLastFetch = Date.now() - serviceState.lastFetch.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      if (timeSinceLastFetch < fiveMinutes) return;
    }

    try {
      dispatch({ 
        type: 'SET_SERVICE_LOADING', 
        payload: { service, loading: true } 
      });

      if (service === 'jira') {
        const response = await apiClient.getJiraProjects();
        dispatch({ 
          type: 'SET_SERVICE_DATA', 
          payload: { service, data: response.projects } 
        });
      } else {
        const response = await apiClient.getConfluenceSpaces();
        dispatch({ 
          type: 'SET_SERVICE_DATA', 
          payload: { service, data: response.spaces } 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : `Failed to fetch ${service} data`;
      
      console.error(`Failed to get ${service} data:`, error);
      
      dispatch({ 
        type: 'SET_SERVICE_ERROR', 
        payload: { service, error: errorMessage } 
      });
    }
  };

  // ============= CONTEXT VALUE =============

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
    clearError,
    fetchServiceData,
    clearServiceError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============= HOOK =============

// PUBLIC_INTERFACE
/**
 * Hook to access authentication context
 * @returns Authentication context with state and methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
