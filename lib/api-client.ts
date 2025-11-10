import { API_BASE_URL } from './constants';
import { getToken } from './storage';
import { getCSRFToken } from './csrf';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetch(endpoint: string, options: FetchOptions = {}) {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
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
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        console.log('[API Client] Including CSRF token in request');
      } else {
        console.warn('[API Client] No CSRF token available for', method, 'request to', endpoint);
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include', // Important: include cookies for CSRF/session
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
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
