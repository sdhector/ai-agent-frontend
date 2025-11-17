import { API_BASE_URL } from './constants';
import { getToken } from './storage';
import { getCSRFToken, fetchCSRFToken } from './csrf';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  retries?: number; // Number of retry attempts (default: 0 - no retries)
  retryDelay?: number; // Base delay in ms for exponential backoff (default: 1000ms)
}

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetch(endpoint: string, options: FetchOptions = {}) {
    const { requiresAuth = true, retries = 0, retryDelay = 1000, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add CSRF token for state-changing methods
    const method = (fetchOptions.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      let csrfToken = getCSRFToken();
      
      // If no CSRF token, try to fetch it from backend
      if (!csrfToken) {
        try {
          console.log('[API Client] No CSRF token found, fetching from backend...');
          csrfToken = await fetchCSRFToken(this.baseUrl);
        } catch (error) {
          console.warn('[API Client] Failed to fetch CSRF token:', error);
        }
      }
      
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        console.log('[API Client] Including CSRF token in request');
      } else {
        console.warn('[API Client] No CSRF token available for', method, 'request to', endpoint);
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          // Calculate exponential backoff delay: retryDelay * 2^(attempt-1)
          const delay = retryDelay * Math.pow(2, attempt - 1);
          console.log(`[API Client] Retrying request (attempt ${attempt}/${retries}) after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include', // Important: include cookies for CSRF/session
        });

        // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
        if (!response.ok) {
          const shouldRetry =
            attempt < retries &&
            (response.status >= 500 || // Server errors
             response.status === 408 || // Request timeout
             response.status === 429);  // Too many requests

          if (!shouldRetry) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
          } else {
            // Log and continue to retry
            console.warn(`[API Client] Request failed with status ${response.status}, will retry...`);
            lastError = new Error(`API Error ${response.status}: ${response.statusText}`);
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Network errors are retryable
        if (attempt < retries) {
          console.warn(`[API Client] Request failed (attempt ${attempt + 1}/${retries + 1}):`, error);
          continue;
        }

        // All retries exhausted
        console.error('API Client Error (all retries exhausted):', error);
        throw error;
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Unknown error occurred');
  }

  async get(endpoint: string, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, body: any, options?: FetchOptions) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint: string, body: any, options?: FetchOptions) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  }

  // Convenience method for JSON responses
  async json<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, options);
    return response.json();
  }

  // Convenience method for posting JSON and getting JSON response
  async postJson<T = any>(endpoint: string, body: any, options?: FetchOptions): Promise<T> {
    const response = await this.post(endpoint, body, options);
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
