/**
 * Configuration utilities for the frontend application
 * Handles environment variables and API configuration
 */

// PUBLIC_INTERFACE
/**
 * Get the API base URL from environment variables
 * @returns The API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

// PUBLIC_INTERFACE
/**
 * Get application configuration from environment variables
 * @returns Application configuration object
 */
export function getAppConfig() {
  return {
    apiUrl: getApiBaseUrl(),
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Atlassian Connect Dashboard',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
}

// PUBLIC_INTERFACE
/**
 * Check if the application is running in development mode
 * @returns Boolean indicating if in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// PUBLIC_INTERFACE
/**
 * Check if the application is running in production mode
 * @returns Boolean indicating if in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// PUBLIC_INTERFACE
/**
 * Validate that required environment variables are set
 * @throws Error if required environment variables are missing
 */
export function validateEnvironment(): void {
  const required = ['NEXT_PUBLIC_API_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
