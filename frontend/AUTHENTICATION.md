# Frontend Authentication Implementation

This document describes the frontend authentication components and system implemented for the Atlassian Connect Dashboard.

## Overview

The authentication system provides comprehensive support for both OAuth 2.0 and API token authentication flows for Jira and Confluence services. It includes dedicated components, hooks for state management, and service logic for backend integration.

## Architecture

### Components Structure

```
src/
├── components/
│   └── auth/
│       ├── AuthPanel.tsx          # Main authentication panel
│       ├── OAuthAuth.tsx          # OAuth authentication component
│       ├── APITokenAuth.tsx       # API token authentication component
│       └── index.ts               # Export file
├── hooks/
│   └── useAuth.ts                 # Authentication state management hook
├── services/
│   └── authService.ts             # API service for authentication
├── utils/
│   ├── config.ts                  # Configuration utilities
│   ├── errors.ts                  # Error handling utilities
│   └── index.ts                   # Utilities export file
└── app/
    └── auth/
        └── callback/
            └── page.tsx           # OAuth callback handler
```

## Authentication Components

### 1. AuthPanel Component

The main authentication panel that provides both OAuth and API token options.

**Features:**
- Tabbed interface for method selection
- OAuth and API token authentication options
- Comparison table showing differences between methods
- Consistent UI/UX following Ocean Professional theme

**Usage:**
```tsx
import { AuthPanel } from '@/components/auth';

<AuthPanel
  service="jira"
  onAuthenticate={handleAuthenticate}
  loading={loading}
  error={error}
/>
```

### 2. OAuthAuth Component

Dedicated OAuth 2.0 authentication component.

**Features:**
- Step-by-step OAuth flow explanation
- Secure redirect handling
- Visual feedback during authentication
- Error handling and display

### 3. APITokenAuth Component

API token authentication with form validation.

**Features:**
- Form validation using react-hook-form and zod
- Real-time validation feedback
- Secure token input handling
- Instructions for token generation

## Authentication Hook (useAuth)

Central state management hook for authentication operations.

**Features:**
- Authentication state management
- Service-specific connection states
- Login/logout operations
- Session management
- Error handling

**Usage:**
```tsx
import { useAuth } from '@/hooks/useAuth';

const {
  isAuthenticated,
  sessionInfo,
  login,
  logout,
  serviceStates,
  clearError
} = useAuth();
```

## Authentication Service

Service layer for API communication with the backend.

**Features:**
- OAuth flow initiation
- API token authentication
- Session management
- Service data fetching (projects/spaces)
- Automatic token refresh
- Error handling with interceptors

**Key Methods:**
- `startJiraOAuth()` / `startConfluenceOAuth()`
- `authenticateJiraAPIToken()` / `authenticateConfluenceAPIToken()`
- `getSessionInfo()` / `logout()`
- `getJiraProjects()` / `getConfluenceSpaces()`

## Authentication Flows

### OAuth 2.0 Flow

1. User clicks "Connect with OAuth"
2. Frontend calls backend OAuth start endpoint
3. Backend returns authorization URL and state
4. User redirects to Atlassian OAuth page
5. User grants permissions
6. Atlassian redirects to callback page with code
7. Callback page exchanges code for session
8. User redirected back to dashboard

### API Token Flow

1. User enters domain, email, and API token
2. Form validates input using zod schema
3. Frontend sends credentials to backend
4. Backend validates with Atlassian API
5. Session created and returned to frontend
6. User authenticated and data fetched

## Configuration

### Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXT_PUBLIC_APP_NAME=Atlassian Connect Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
```

### Backend Integration

The frontend integrates with the backend API endpoints:

- `/auth/jira/oauth/start` - Start Jira OAuth
- `/auth/jira/oauth/callback` - Jira OAuth callback
- `/auth/jira/api-token` - Jira API token auth
- `/auth/confluence/oauth/start` - Start Confluence OAuth
- `/auth/confluence/oauth/callback` - Confluence OAuth callback
- `/auth/confluence/api-token` - Confluence API token auth
- `/auth/session` - Get/delete session
- `/jira/projects` - Get Jira projects
- `/confluence/spaces` - Get Confluence spaces

## State Management

### Authentication State

```typescript
interface AuthState {
  isAuthenticated: boolean;
  sessionInfo: SessionInfo | null;
  loading: boolean;
  error: string | null;
}
```

### Service Connection State

```typescript
interface ServiceConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  projects?: JiraProject[];
  spaces?: ConfluenceSpace[];
}
```

## Error Handling

The system includes comprehensive error handling:

- API error parsing and user-friendly messages
- Network error detection
- Authentication error handling
- Form validation errors
- Loading states and feedback

## Security Features

- CSRF protection with state parameter in OAuth
- Secure token storage in localStorage
- Automatic session validation
- Token expiration handling
- HTTP-only communication with backend

## Testing

To test the authentication system:

1. Start the development server: `npm run dev`
2. Navigate to the application
3. Try both OAuth and API token flows
4. Verify error handling with invalid credentials
5. Test session management and logout

## Dependencies

Key dependencies used:

- `axios` - HTTP client for API calls
- `react-hook-form` - Form handling and validation
- `@hookform/resolvers` - Resolver for zod integration
- `zod` - Schema validation for forms

## Styling

The components follow the Ocean Professional theme with:

- Primary color: #1E3A8A (blue)
- Secondary color: #F59E0B (amber)
- Success color: #059669 (green)
- Error color: #DC2626 (red)
- Professional, clean styling
- Responsive design
- Accessibility considerations

## Future Enhancements

Potential improvements:

- Remember user preference for authentication method
- Advanced session management with refresh tokens
- Multi-factor authentication support
- Session timeout warnings
- Advanced error recovery
- Offline state handling
