import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  APITokenRequest, 
  AuthenticationResponse, 
  OAuthStartResponse, 
  SessionInfo,
  JiraProjectsResponse,
  ConfluenceSpacesResponse,
  ServiceType,
  AccessibleResourcesResponse
} from '@/types';
import { getApiBaseUrl } from '@/utils/config';

/**
 * API Error class for handling backend errors consistently
 */
export class APIError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * API Client for handling all backend communication
 * Provides centralized error handling, request/response interceptors,
 * and TypeScript-typed methods for all backend endpoints
 */
class APIClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadSessionFromStorage();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to add session ID
    this.client.interceptors.request.use(
      (config) => {
        if (this.sessionId) {
          config.headers['X-Session-Id'] = this.sessionId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: AxiosError): APIError {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        this.clearSession();
        return new APIError(
          'Authentication required. Please log in again.',
          status,
          'UNAUTHORIZED',
          data
        );
      }

      // Handle validation errors
      if (status === 422 && data && typeof data === 'object' && 'detail' in data) {
        const validationDetails = (data as Record<string, unknown>).detail;
        return new APIError(
          'Validation error occurred.',
          status,
          'VALIDATION_ERROR',
          validationDetails
        );
      }

      // Handle other HTTP errors
      const message = data && typeof data === 'object' && 'message' in data
        ? (data as Record<string, unknown>).message as string
        : `Request failed with status ${status}`;

      return new APIError(message, status, 'HTTP_ERROR', data);
    }

    if (error.request) {
      return new APIError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    return new APIError(
      error.message || 'An unexpected error occurred.',
      0,
      'UNKNOWN_ERROR'
    );
  }

  /**
   * Load session ID from localStorage
   */
  private loadSessionFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.sessionId = localStorage.getItem('sessionId');
    }
  }

  /**
   * Set session ID and persist to storage
   */
  public setSession(sessionId: string): void {
    this.sessionId = sessionId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
    }
  }

  /**
   * Clear session ID and remove from storage
   */
  public clearSession(): void {
    this.sessionId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.sessionId;
  }

  /**
   * Get current session ID
   */
  public getSessionId(): string | null {
    return this.sessionId;
  }

  // ============= AUTHENTICATION ENDPOINTS =============

  // PUBLIC_INTERFACE
  /**
   * Start OAuth flow for Jira
   * @returns Promise containing authorization URL and state
   */
  async startJiraOAuth(): Promise<OAuthStartResponse> {
    const response: AxiosResponse<OAuthStartResponse> = await this.client.get('/auth/jira/oauth/start');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Start OAuth flow for Confluence
   * @returns Promise containing authorization URL and state
   */
  async startConfluenceOAuth(): Promise<OAuthStartResponse> {
    const response: AxiosResponse<OAuthStartResponse> = await this.client.get('/auth/confluence/oauth/start');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate with Jira using API token
   * @param credentials API token credentials
   * @returns Promise containing authentication response
   */
  async authenticateJiraAPIToken(credentials: APITokenRequest): Promise<AuthenticationResponse> {
    const response: AxiosResponse<AuthenticationResponse> = await this.client.post('/auth/jira/api-token', credentials);
    
    if (response.data.success && response.data.session_id) {
      this.setSession(response.data.session_id);
    }
    
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate with Confluence using API token
   * @param credentials API token credentials
   * @returns Promise containing authentication response
   */
  async authenticateConfluenceAPIToken(credentials: APITokenRequest): Promise<AuthenticationResponse> {
    const response: AxiosResponse<AuthenticationResponse> = await this.client.post('/auth/confluence/api-token', credentials);
    
    if (response.data.success && response.data.session_id) {
      this.setSession(response.data.session_id);
    }
    
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get current session information
   * @returns Promise containing session details
   */
  async getSessionInfo(): Promise<SessionInfo> {
    const response: AxiosResponse<SessionInfo> = await this.client.get('/auth/session');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Logout and invalidate current session
   * @returns Promise containing logout confirmation
   */
  async logout(): Promise<{ message: string }> {
    const response = await this.client.delete('/auth/session');
    this.clearSession();
    return response.data;
  }

  // ============= JIRA ENDPOINTS =============

  // PUBLIC_INTERFACE
  /**
   * Get accessible Jira resources for OAuth authenticated users
   * @returns Promise containing accessible resources
   */
  async getJiraResources(): Promise<AccessibleResourcesResponse> {
    const response: AxiosResponse<AccessibleResourcesResponse> = await this.client.get('/jira/resources');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get Jira projects for authenticated user
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing Jira projects response
   */
  async getJiraProjects(cloudId?: string): Promise<JiraProjectsResponse> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response: AxiosResponse<JiraProjectsResponse> = await this.client.get('/jira/projects', { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get detailed information about a specific Jira project
   * @param projectKey Project key or ID
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing project details
   */
  async getJiraProjectDetails(projectKey: string, cloudId?: string): Promise<Record<string, unknown>> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response = await this.client.get(`/jira/projects/${projectKey}`, { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get user permissions in Jira
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing user permissions
   */
  async getJiraPermissions(cloudId?: string): Promise<Record<string, unknown>> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response = await this.client.get('/jira/permissions', { params });
    return response.data;
  }

  // ============= CONFLUENCE ENDPOINTS =============

  // PUBLIC_INTERFACE
  /**
   * Get accessible Confluence resources for OAuth authenticated users
   * @returns Promise containing accessible resources
   */
  async getConfluenceResources(): Promise<AccessibleResourcesResponse> {
    const response: AxiosResponse<AccessibleResourcesResponse> = await this.client.get('/confluence/resources');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get Confluence spaces for authenticated user
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing Confluence spaces response
   */
  async getConfluenceSpaces(cloudId?: string): Promise<ConfluenceSpacesResponse> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response: AxiosResponse<ConfluenceSpacesResponse> = await this.client.get('/confluence/spaces', { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get detailed information about a specific Confluence space
   * @param spaceKey Space key
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing space details
   */
  async getConfluenceSpaceDetails(spaceKey: string, cloudId?: string): Promise<Record<string, unknown>> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response = await this.client.get(`/confluence/spaces/${spaceKey}`, { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get content from a specific Confluence space
   * @param spaceKey Space key
   * @param contentType Type of content ('page' or 'blogpost')
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing space content
   */
  async getConfluenceSpaceContent(spaceKey: string, contentType: string = 'page', cloudId?: string): Promise<Record<string, unknown>> {
    const params: Record<string, string> = { content_type: contentType };
    if (cloudId) params.cloud_id = cloudId;
    
    const response = await this.client.get(`/confluence/spaces/${spaceKey}/content`, { params });
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get user information in Confluence
   * @param cloudId Optional cloud ID for OAuth authentication
   * @returns Promise containing user information
   */
  async getConfluenceUserInfo(cloudId?: string): Promise<Record<string, unknown>> {
    const params = cloudId ? { cloud_id: cloudId } : {};
    const response = await this.client.get('/confluence/user', { params });
    return response.data;
  }

  // ============= HEALTH CHECK =============

  // PUBLIC_INTERFACE
  /**
   * Health check endpoint
   * @returns Promise containing health status
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.client.get('/');
    return response.data;
  }

  // PUBLIC_INTERFACE
  /**
   * Authentication service health check
   * @returns Promise containing auth health status
   */
  async authHealthCheck(): Promise<Record<string, unknown>> {
    const response = await this.client.get('/auth/health');
    return response.data;
  }

  // ============= OAUTH UTILITIES =============

  // PUBLIC_INTERFACE
  /**
   * Handle OAuth callback by processing URL parameters
   * @returns Object containing code, state, and error parameters
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
   * Initiate OAuth flow by redirecting to authorization URL
   * @param service Service type (jira or confluence)
   * @returns Promise that resolves when redirect is initiated
   */
  async initiateOAuth(service: ServiceType): Promise<void> {
    try {
      const oauthResponse = service === 'jira' 
        ? await this.startJiraOAuth()
        : await this.startConfluenceOAuth();
      
      // Store state and service for validation on callback
      if (typeof window !== 'undefined') {
        localStorage.setItem('oauth_state', oauthResponse.state);
        localStorage.setItem('oauth_service', service);
      }
      
      // Redirect to authorization URL
      window.location.href = oauthResponse.authorization_url;
    } catch (error) {
      console.error(`Failed to initiate ${service} OAuth:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing purposes
export { APIClient };

// Default export
export default apiClient;
