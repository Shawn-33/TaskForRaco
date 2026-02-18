# Token Authentication Fix - Complete Guide

## Problem Identified
The application was experiencing 403 Forbidden errors because:
1. Token was not being properly persisted across page reloads
2. Zustand store was not using persistence middleware
3. Hydration issues with Next.js SSR causing token to be unavailable on initial render

## Solutions Implemented

### 1. Added Zustand Persist Middleware
**File: `frontend/src/store/index.ts`**

Changed from manual localStorage handling to Zustand's built-in persist middleware:

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... state and actions
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Benefits:**
- Automatic persistence to localStorage
- Proper hydration handling
- State rehydration on page reload
- Type-safe storage

### 2. Enhanced API Client Token Handling
**File: `frontend/src/lib/api.ts`**

Added immediate token saving after login/register:

```typescript
async login(email: string, password: string) {
  const response = await this.client.post('/auth/login', { email, password });
  // Save token immediately after successful login
  if (response.data.access_token && typeof window !== 'undefined') {
    localStorage.setItem('token', response.data.access_token);
  }
  return response;
}
```

**Why this helps:**
- Double ensures token is saved
- Provides fallback if store hasn't hydrated yet
- Immediate availability for subsequent requests

### 3. Fixed Hydration Issues
**Files: `frontend/src/app/solver/dashboard/page.tsx`, `frontend/src/app/marketplace/page.tsx`, `frontend/src/components/Navigation.tsx`**

Added mounted state to handle Next.js hydration:

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  if (!mounted) return;
  // ... fetch data only after hydration
}, [mounted]);
```

**Why this is necessary:**
- Next.js renders on server first (no localStorage)
- Client needs to hydrate before accessing localStorage
- Prevents hydration mismatch errors

### 4. Improved Token Checking
**File: `frontend/src/app/marketplace/page.tsx`**

Added explicit token check before fetching user-specific data:

```typescript
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (token) {
  try {
    const appsRes = await apiClient.getMyApplications();
    // ... handle applications
  } catch (error) {
    // Gracefully handle if not logged in
  }
}
```

## How Token Flow Works Now

### Registration/Login Flow:
1. User submits credentials
2. API returns `access_token`
3. Token saved to localStorage immediately (API client)
4. Token saved to Zustand store (with persist)
5. User state saved to Zustand store (with persist)
6. User redirected to dashboard

### Page Reload Flow:
1. Next.js renders page on server (no token yet)
2. Page hydrates on client
3. Zustand persist middleware rehydrates state from localStorage
4. Token and user state restored
5. API client reads token from localStorage
6. Authenticated requests work

### API Request Flow:
1. Request interceptor checks localStorage for token
2. If token exists, adds `Authorization: Bearer {token}` header
3. Request sent to backend
4. If 401 response, user redirected to login
5. If 403 response, user lacks permissions (different from 401)

## Testing the Fix

### 1. Clear Storage First
```javascript
// Open browser console
localStorage.clear();
sessionStorage.clear();
```

### 2. Register New User
1. Go to `/auth/register`
2. Fill in details
3. Submit form
4. Check console: Should see token saved
5. Check localStorage: Should see `app-storage` key

### 3. Verify Token Persistence
1. After login, open DevTools → Application → Local Storage
2. Should see: `app-storage` with JSON containing `token` and `user`
3. Reload page (F5)
4. Token should still be there
5. Dashboard should load without 403 errors

### 4. Test API Calls
1. Login as solver
2. Go to `/solver/dashboard`
3. Open Network tab
4. Should see requests with `Authorization: Bearer ...` header
5. Should get 200 responses, not 403

### 5. Test Logout
1. Click logout
2. Check localStorage: `app-storage` should be cleared
3. Try accessing `/solver/dashboard`
4. Should redirect to login

## Common Issues & Solutions

### Issue: Still getting 403 errors
**Solution:**
1. Clear browser cache and localStorage
2. Re-login
3. Check Network tab for Authorization header
4. Verify token format in localStorage

### Issue: Token disappears on reload
**Solution:**
1. Check if Zustand persist is working: `localStorage.getItem('app-storage')`
2. Ensure no other code is clearing localStorage
3. Check browser console for errors

### Issue: Hydration mismatch errors
**Solution:**
1. Ensure all components using auth state have `mounted` check
2. Don't render user-specific content until `mounted === true`
3. Use loading states during hydration

### Issue: 401 vs 403 errors
**Difference:**
- **401 Unauthorized**: No token or invalid token → Redirect to login
- **403 Forbidden**: Valid token but insufficient permissions → Show error message

## Backend Token Verification

The backend expects tokens in this format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Verify backend is:
1. Accepting Bearer tokens
2. Validating token signature
3. Checking token expiration
4. Returning correct user info

## Debugging Commands

### Check if token is saved:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('App Storage:', localStorage.getItem('app-storage'));
```

### Check Zustand state:
```javascript
// In component
const { user, token } = useAppStore();
console.log('User:', user);
console.log('Token:', token);
```

### Check API request headers:
```javascript
// In browser Network tab
// Click on any API request
// Check "Request Headers" section
// Should see: Authorization: Bearer ...
```

## Files Modified

1. ✅ `frontend/src/store/index.ts` - Added persist middleware
2. ✅ `frontend/src/lib/api.ts` - Enhanced token saving
3. ✅ `frontend/src/app/solver/dashboard/page.tsx` - Added hydration handling
4. ✅ `frontend/src/app/marketplace/page.tsx` - Added token check
5. ✅ `frontend/src/components/Navigation.tsx` - Added hydration handling

## Next Steps

1. Test login/register flow
2. Test page reload persistence
3. Test logout functionality
4. Test protected routes
5. Monitor for any remaining 403 errors

## Success Criteria

✅ Token persists across page reloads
✅ No 403 errors on authenticated endpoints
✅ User state maintained after refresh
✅ Logout clears all auth data
✅ Protected routes redirect when not authenticated
✅ No hydration mismatch warnings

## Additional Recommendations

### 1. Add Token Expiration Handling
Consider adding token refresh logic:
```typescript
// Check token expiration
const isTokenExpired = (token: string) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};
```

### 2. Add Loading States
Show loading indicators during auth checks:
```typescript
if (!mounted || loading) {
  return <LoadingSpinner />;
}
```

### 3. Add Error Boundaries
Catch and handle auth errors gracefully:
```typescript
try {
  await apiClient.getMyApplications();
} catch (error) {
  if (error.response?.status === 403) {
    // Handle permission error
  }
}
```

## Summary

The token authentication system now properly:
- Saves tokens to localStorage
- Persists across page reloads
- Handles Next.js hydration
- Includes proper error handling
- Provides a seamless user experience

All 403 Forbidden errors related to missing tokens should now be resolved.
