# CSRF Token Implementation

## Overview

This document describes the CSRF (Cross-Site Request Forgery) token implementation in the AI Agent frontend.

## Problem

The backend API expects CSRF tokens for state-changing requests (POST, PUT, DELETE, PATCH) but the frontend wasn't providing them, resulting in:

```
POST /api/ai 403 (Forbidden)
API Error 403: {"success":false,"error":"Invalid CSRF token"}
```

## Solution

Implemented a complete CSRF token flow:

### 1. CSRF Token Extraction (`lib/csrf.ts`)

- `getCSRFTokenFromCookie()` - Reads CSRF token from cookies
- `getCSRFTokenFromMeta()` - Reads CSRF token from meta tags (fallback)
- `getCSRFToken()` - Main function that tries both methods
- `fetchCSRFToken()` - Fetches CSRF token from backend endpoint

Supports multiple CSRF cookie name formats:
- `csrf_token`
- `CSRF-TOKEN`
- `csrftoken`
- `XSRF-TOKEN`
- `_csrf`

### 2. API Client Integration (`lib/api-client.ts`)

The API client now:
- Includes `credentials: 'include'` to send cookies with all requests
- Automatically extracts CSRF token from cookies for POST/PUT/DELETE/PATCH requests
- Adds `X-CSRF-Token` header with the token value
- Logs warnings if CSRF token is not available

### 3. Authentication Flow (`contexts/AuthContext.tsx`)

- Attempts to fetch CSRF token during authentication check
- Only on web platform (CSRF not needed for native apps)
- Ensures token is available before making authenticated requests

## How It Works

### Flow Diagram

```
1. User authenticates
   ↓
2. Backend sets CSRF token cookie (automatic)
   ↓
3. Frontend reads cookie via getCSRFToken()
   ↓
4. Frontend includes token in X-CSRF-Token header
   ↓
5. Backend validates token and allows request
```

### Request Example

```typescript
// Before (failed with 403)
POST /api/ai
Headers:
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
Body: { message: "Hello" }

// After (successful)
POST /api/ai
Headers:
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  X-CSRF-Token: <csrf_token_from_cookie>
Credentials: include
Body: { message: "Hello" }
```

## Backend Requirements

For this implementation to work, the backend must:

1. **Set CSRF cookie** on successful authentication or GET requests
   - Cookie should be HttpOnly: false (so JavaScript can read it)
   - Common cookie names: `csrf_token`, `XSRF-TOKEN`, etc.

2. **Validate CSRF token** on POST/PUT/DELETE/PATCH requests
   - Check `X-CSRF-Token` header matches cookie value
   - Return 403 if token is invalid or missing

3. **Optional: Provide CSRF endpoint**
   - `GET /api/csrf-token` - Returns fresh CSRF token
   - Response: `{ csrfToken: "..." }`

## Testing

### Manual Testing

1. Open browser DevTools → Network tab
2. Send a message in the chat
3. Check the POST request to `/api/ai`:
   - Headers should include `X-CSRF-Token`
   - Cookies should be sent (check Cookie header)
   - Response should be 200 OK (not 403)

### Console Logs

The implementation includes detailed logging:

```
[CSRF] Found CSRF token in cookie: csrf_token
[API Client] Including CSRF token in request
```

If CSRF token is missing:

```
[CSRF] No CSRF token found in cookies
[API Client] No CSRF token available for POST request to /api/ai
```

## Troubleshooting

### Still getting 403 errors?

1. **Check if backend sets the cookie**:
   - Open DevTools → Application → Cookies
   - Look for CSRF token cookie
   - If missing, backend isn't setting it

2. **Check cookie attributes**:
   - Must have `HttpOnly: false` (so JavaScript can read it)
   - Must have correct `Domain` and `Path`
   - If `SameSite: Strict`, requests might fail

3. **Check token format**:
   - Some backends expect token in different header
   - Try: `X-XSRF-TOKEN`, `X-CSRFToken`, etc.

4. **Check CORS configuration**:
   - Backend must allow credentials: `Access-Control-Allow-Credentials: true`
   - Frontend origin must be in `Access-Control-Allow-Origin`

### Backend not setting cookie?

If the backend doesn't automatically set a CSRF cookie:

1. Call the CSRF endpoint manually:
   ```typescript
   await fetchCSRFToken(API_BASE_URL);
   ```

2. Or implement token retrieval from response headers:
   ```typescript
   const token = response.headers.get('X-CSRF-Token');
   ```

## Files Modified

- `lib/csrf.ts` - New file with CSRF utilities
- `lib/api-client.ts` - Updated to include CSRF tokens
- `contexts/AuthContext.tsx` - Updated to initialize CSRF token

## Security Notes

- CSRF tokens protect against Cross-Site Request Forgery attacks
- Tokens are per-session and should expire when user logs out
- Never hardcode CSRF tokens
- Always use HTTPS in production
- CSRF tokens complement (not replace) JWT authentication

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)
