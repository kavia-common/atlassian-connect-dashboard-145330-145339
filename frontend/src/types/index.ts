// Backend API Response Types
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified?: boolean | null;
  style?: string | null;
  isPrivate?: boolean | null;
  description?: string | null;
  url?: string | null;
  email?: string | null;
  assigneeType?: string | null;
  avatarUrls?: Record<string, string> | null;
  projectCategory?: Record<string, unknown> | null;
}

export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: string;
  status?: string | null;
  description?: Record<string, unknown> | null;
  homepage?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  _links?: Record<string, string> | null;
}

export interface APITokenRequest {
  domain: string;
  email: string;
  apiToken: string;
}

export interface AuthenticationResponse {
  success: boolean;
  message: string;
  session_id?: string | null;
  user_info?: Record<string, unknown> | null;
}

export interface JiraProjectsResponse {
  success: boolean;
  projects: JiraProject[];
  cloud_id?: string | null;
  total_count: number;
}

export interface ConfluenceSpacesResponse {
  success: boolean;
  spaces: ConfluenceSpace[];
  cloud_id?: string | null;
  total_count: number;
}

export interface ResourceInfo {
  id: string;
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

export interface AccessibleResourcesResponse {
  success: boolean;
  resources: ResourceInfo[];
}

export interface OAuthStartResponse {
  authorization_url: string;
  state: string;
}

export interface SessionInfo {
  session_id: string;
  user_id: string;
  email: string;
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  expires_at: string;
  provider: string;
  auth_method: string;
  domain?: string | null;
  created_at: string;
  last_accessed: string;
}

// Frontend Types
export type ServiceType = 'jira' | 'confluence';
export type AuthMethod = 'oauth' | 'api-token';

export interface ConnectionState {
  connected: boolean;
  loading: boolean;
  projects?: JiraProject[];
  spaces?: ConfluenceSpace[];
  sessionId?: string;
  error?: string;
}

export interface ConnectionData {
  jira: ConnectionState;
  confluence: ConnectionState;
}

// Generic project/space interface for components
export interface ProjectItem {
  id: string;
  key: string;
  name: string;
  projectTypeKey?: string;
  type?: string;
  description?: string | null;
  url?: string | null;
}
