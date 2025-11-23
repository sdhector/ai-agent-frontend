import { API_BASE_URL, FALLBACK_API_URL } from './constants';
import { getToken } from './storage';
import { getCSRFToken, fetchCSRFToken } from './csrf';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  retries?: number; // Number of retry attempts (default: 0 - no retries)
  retryDelay?: number; // Base delay in ms for exponential backoff (default: 1000ms)
  useFallback?: boolean; // Whether to try fallback URL on failure (default: true in dev)
}

export class APIClient {
  private baseUrl: string;
  private fallbackUrl: string;
  private pendingRequests: Map<string, Promise<Response>> = new Map();
  private useFallback: boolean;

  constructor(baseUrl: string = API_BASE_URL, fallbackUrl: string = FALLBACK_API_URL) {
    this.baseUrl = baseUrl;
    this.fallbackUrl = fallbackUrl;
    // Enable fallback in development when using localhost
    this.useFallback = __DEV__ && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'));
  }

  async fetch(endpoint: string, options: FetchOptions = {}) {
    const { requiresAuth = true, retries = 0, retryDelay = 1000, useFallback = this.useFallback, ...fetchOptions } = options;

    // Create a unique key for this request (endpoint + method)
    // Only deduplicate GET requests to avoid issues with POST/PUT/DELETE
    const method = (fetchOptions.method || 'GET').toUpperCase();
    const requestKey = method === 'GET' ? `${method}:${endpoint}` : null;

    // If this is a GET request and we already have a pending request, return it
    if (requestKey && this.pendingRequests.has(requestKey)) {
      console.log(`[API Client] Deduplicating request: ${requestKey}`);
      return this.pendingRequests.get(requestKey)!;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add CSRF token for state-changing methods
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

    // Create the request promise and store it if this is a GET request
    const requestPromise = (async () => {
      // Try primary URL first, then fallback if enabled
      const urlsToTry = useFallback ? [this.baseUrl, this.fallbackUrl] : [this.baseUrl];
      let lastError: Error | null = null;
      
      for (const baseUrl of urlsToTry) {
        const url = `${baseUrl}${endpoint}`;
        
        // If this is not the first URL, log the fallback attempt
        if (baseUrl !== this.baseUrl) {
          console.log(`[API Client] Primary URL failed, trying fallback: ${baseUrl}`);
        }
        
        // Retry logic with exponential backoff
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

          // Don't retry on client errors (4xx) except 408 (timeout)
          // Note: 429 (rate limit) should NOT be retried immediately as it will make the problem worse
          // Note: 401 (unauthorized) should be handled by the caller (AuthContext) to clear invalid tokens
          if (!response.ok) {
            const shouldRetry =
              attempt < retries &&
              (response.status >= 500 || // Server errors
               response.status === 408); // Request timeout

            if (!shouldRetry) {
              // For 401 errors, return the response so the caller can handle token clearing
              // Don't consume the response body so the caller can read it if needed
              if (response.status === 401) {
                console.warn('[API Client] 401 Unauthorized - returning response for caller to handle');
                return response; // Return the response so AuthContext can clear the token
              }
              
              // For other errors, read the body and throw
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

            // If this is the last attempt for primary URL and we have a fallback, try next URL
            if (baseUrl === this.baseUrl && urlsToTry.length > 1) {
              console.warn(`[API Client] Primary URL failed after ${retries + 1} attempts, will try fallback:`, error);
              break; // Break out of retry loop to try fallback URL
            }

            // If no more retries and no fallback, throw the error
            if (baseUrl === this.fallbackUrl || urlsToTry.length === 1) {
              console.error('API Client Error (all retries exhausted):', error);
              throw error;
            }
          }
        }
      }

      // All URLs exhausted
      throw lastError || new Error('Unknown error occurred');
    })();

    // Store the promise for GET requests to enable deduplication
    if (requestKey) {
      this.pendingRequests.set(requestKey, requestPromise);
      // Clean up after the request completes (success or failure)
      requestPromise.finally(() => {
        this.pendingRequests.delete(requestKey);
      });
    }

    return requestPromise;
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

