import axios, { AxiosResponse } from 'axios';
import { 
  APITokenRequest, 
  AuthenticationResponse, 
  OAuthStartResponse, 
  SessionInfo,
  JiraProjectsResponse,
  ConfluenceSpacesResponse,
  ServiceType 
} from '@/types';
import { getApiBaseUrl } from '@/utils';

// Base API URL from configuration
const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include session ID in headers
apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid session
      localStorage.removeItem('sessionId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication service for handling OAuth and API token flows
 */
class AuthService {
  
  // PUBLIC_INTERFACE
  /**
   * Start OAuth flow for Jira
   * @returns Promise containing authorization URL and state
   */
  async startJiraOAuth(): Promise<OAuthStartResponse> {
    const response: AxiosResponse<OAuthStartResponse> = await apiClient.get('/auth/jira/oauth/start');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Start OAuth flow for Confluence
   * @returns Promise containing authorization URL and state
   */
  async startConfluenceOAuth(): Promise<OAuthStartResponse> {
    const response: AxiosResponse<OAuthStartResponse> = await apiClient.get('/auth/confluence/oauth/start');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate with Jira using API token
   * @param credentials - API token credentials
   * @returns Promise containing authentication response
   */
  async authenticateJiraAPIToken(credentials: APITokenRequest): Promise<AuthenticationResponse> {
    const response: AxiosResponse<AuthenticationResponse> = await apiClient.post('/auth/jira/api-token', credentials);
    
    if (response.data.success && response.data.session_id) {
      localStorage.setItem('sessionId', response.data.session_id);
    }
    
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate with Confluence using API token
   * @param credentials - API token credentials
   * @returns Promise containing authentication response
   */
  async authenticateConfluenceAPIToken(credentials: APITokenRequest): Promise<AuthenticationResponse> {
    const response: AxiosResponse<AuthenticationResponse> = await apiClient.post('/auth/confluence/api-token', credentials);
    
    if (response.data.success && response.data.session_id) {
      localStorage.setItem('sessionId', response.data.session_id);
    }
    
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get current session information
   * @returns Promise containing session details
   */
  async getSessionInfo(): Promise<SessionInfo> {
    const response: AxiosResponse<SessionInfo> = await apiClient.get('/auth/session');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Logout and invalidate current session
   * @returns Promise containing logout confirmation
   */
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.delete('/auth/session');
    localStorage.removeItem('sessionId');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get Jira projects for authenticated user
   * @param cloudId - Optional cloud ID for OAuth authentication
   * @returns Promise containing Jira projects response
   */
  async getJiraProjects(cloudId?: string): Promise<JiraProjectsResponse> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response: AxiosResponse<JiraProjectsResponse> = await apiClient.get('/jira/projects', { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get Confluence spaces for authenticated user
   * @param cloudId - Optional cloud ID for OAuth authentication
   * @returns Promise containing Confluence spaces response
   */
  async getConfluenceSpaces(cloudId?: string): Promise<ConfluenceSpacesResponse> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response: AxiosResponse<ConfluenceSpacesResponse> = await apiClient.get('/confluence/spaces', { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Handle OAuth callback by processing URL parameters
   * This method should be called on the OAuth callback page
   */
  handleOAuthCallback(): { code?: string; state?: string; error?: string } {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    return {
      code: urlParams.get('code') || undefined,
      state: urlParams.get('state') || undefined,
      error: urlParams.get('error') || undefined,
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Check if user is currently authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('sessionId');
  }

  // PUBLIC_INTERFACE
  /**
   * Get stored session ID
   * @returns Session ID string or null
   */
  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }

  // PUBLIC_INTERFACE
  /**
   * Initiate OAuth flow by redirecting to authorization URL
   * @param service - Service type (jira or confluence)
   */
  async initiateOAuth(service: ServiceType): Promise<void> {
    try {
      const oauthResponse = service === 'jira' 
        ? await this.startJiraOAuth()
        : await this.startConfluenceOAuth();
      
      // Store state for validation on callback
      localStorage.setItem('oauth_state', oauthResponse.state);
      localStorage.setItem('oauth_service', service);
      
      // Redirect to authorization URL
      window.location.href = oauthResponse.authorization_url;
    } catch (error) {
      console.error(`Failed to initiate ${service} OAuth:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
