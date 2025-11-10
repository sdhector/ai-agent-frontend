/**
 * CSRF Token Management
 * Handles CSRF token extraction from cookies and storage
 */

/**
 * Extract CSRF token from cookies
 * Looks for common CSRF cookie names
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null; // Not in browser environment
  }

  // Common CSRF cookie names used by backends
  const possibleNames = [
    'csrf_token',
    'CSRF-TOKEN',
    'csrftoken',
    'XSRF-TOKEN',
    '_csrf',
  ];

  const cookies = document.cookie.split(';');

  for (const cookieName of possibleNames) {
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName && value) {
        console.log(`[CSRF] Found CSRF token in cookie: ${cookieName}`);
        return decodeURIComponent(value);
      }
    }
  }

  console.warn('[CSRF] No CSRF token found in cookies');
  return null;
}

/**
 * Get CSRF token from meta tags (alternative approach)
 */
export function getCSRFTokenFromMeta(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    const token = metaTag.getAttribute('content');
    if (token) {
      console.log('[CSRF] Found CSRF token in meta tag');
      return token;
    }
  }

  return null;
}

/**
 * Get CSRF token from any available source
 * Tries cookies first, then meta tags
 */
export function getCSRFToken(): string | null {
  return getCSRFTokenFromCookie() || getCSRFTokenFromMeta();
}

/**
 * Fetch CSRF token from backend endpoint
 * Use this if backend provides a dedicated CSRF endpoint
 */
export async function fetchCSRFToken(baseUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    });

    if (response.ok) {
      const data = await response.json();
      if (data.csrfToken) {
        console.log('[CSRF] Fetched CSRF token from backend');
        return data.csrfToken;
      }
    }
  } catch (error) {
    console.warn('[CSRF] Failed to fetch CSRF token:', error);
  }

  return null;
}
