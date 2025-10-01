/**
 * Error handling utilities for the frontend application
 * Provides consistent error handling and user-friendly error messages
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

// PUBLIC_INTERFACE
/**
 * Parse API error response and return user-friendly error message
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export function parseApiError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // Handle Axios errors
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; detail?: string }; status?: number }; message?: string };
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'Authentication failed. Please check your credentials.';
        case 403:
          return 'Access denied. You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Internal server error. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return `Request failed with status ${axiosError.response.status}`;
      }
    }
    
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

// PUBLIC_INTERFACE
/**
 * Create a standardized API error object
 * @param message - Error message
 * @param status - HTTP status code
 * @param code - Error code
 * @param details - Additional error details
 * @returns Standardized API error object
 */
export function createApiError(
  message: string,
  status?: number,
  code?: string,
  details?: unknown
): ApiError {
  return {
    message,
    status,
    code,
    details,
  };
}

// PUBLIC_INTERFACE
/**
 * Check if an error is a network/connection error
 * @param error - Error object to check
 * @returns Boolean indicating if it's a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const axiosError = error as { code?: string };
    return axiosError.code === 'NETWORK_ERROR' || 
           axiosError.code === 'ECONNREFUSED' ||
           axiosError.code === 'ENOTFOUND';
  }
  
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('connection');
  }
  
  return false;
}

// PUBLIC_INTERFACE
/**
 * Check if an error is an authentication error
 * @param error - Error object to check
 * @returns Boolean indicating if it's an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 401;
  }
  
  return false;
}

// PUBLIC_INTERFACE
/**
 * Log error with appropriate level based on error type
 * @param error - Error to log
 * @param context - Additional context for the error
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = parseApiError(error);
  const logContext = context ? `[${context}]` : '';
  
  if (isNetworkError(error)) {
    console.warn(`${logContext} Network error:`, errorMessage);
  } else if (isAuthError(error)) {
    console.warn(`${logContext} Authentication error:`, errorMessage);
  } else {
    console.error(`${logContext} Error:`, errorMessage, error);
  }
}
