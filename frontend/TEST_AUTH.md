# Quick Authentication Test Guide

## Step-by-Step Testing

### 1. Clear Everything First
Open browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. Register a New User
1. Navigate to: `http://localhost:3000/auth/register`
2. Fill in the form:
   - Role: Problem Solver
   - Full Name: Test Solver
   - Email: solver@test.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"

### 3. Verify Token is Saved
Open browser console and check:
```javascript
// Should show the JWT token
console.log('Token:', localStorage.getItem('token'));

// Should show JSON with user and token
console.log('App Storage:', JSON.parse(localStorage.getItem('app-storage')));
```

Expected output:
```json
{
  "state": {
    "user": {
      "id": 1,
      "email": "solver@test.com",
      "full_name": "Test Solver",
      "role": "problem_solver",
      "is_active": true,
      "created_at": "2024-...",
      "updated_at": "2024-..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "projects": []
  },
  "version": 0
}
```

### 4. Test Page Reload
1. Press F5 to reload the page
2. You should stay logged in
3. Check console again - token should still be there
4. Dashboard should load without errors

### 5. Test API Calls
1. Open Network tab (F12 → Network)
2. Navigate to `/solver/dashboard`
3. Look for API requests to:
   - `/api/marketplace/my-applications`
   - `/api/solver/my-assignments`
4. Click on each request
5. Check "Request Headers" section
6. Should see: `Authorization: Bearer eyJhbGci...`

### 6. Test Logout
1. Click "Logout" button
2. Check console:
```javascript
console.log('Token after logout:', localStorage.getItem('token'));
console.log('App Storage after logout:', localStorage.getItem('app-storage'));
```
3. Both should be null or empty
4. You should be redirected to home page

### 7. Test Login
1. Navigate to: `http://localhost:3000/auth/login`
2. Login with:
   - Email: solver@test.com
   - Password: password123
3. Should redirect to `/solver/dashboard`
4. Token should be saved again

## Expected Behavior

### ✅ Success Indicators:
- No 403 Forbidden errors in console
- Token visible in localStorage
- User stays logged in after page reload
- API requests include Authorization header
- Dashboard loads data successfully
- Logout clears all auth data

### ❌ Failure Indicators:
- 403 errors in console
- Token is null or undefined
- User logged out after page reload
- API requests missing Authorization header
- Dashboard shows "Loading..." forever
- Logout doesn't clear token

## Troubleshooting

### If you see 403 errors:
1. Check if token exists:
```javascript
console.log('Has token:', !!localStorage.getItem('token'));
```

2. Check if token is in request:
- Open Network tab
- Click on failing request
- Check Request Headers
- Look for Authorization header

3. If Authorization header is missing:
- Token might not be saved
- Try logging in again
- Clear cache and retry

### If token disappears on reload:
1. Check browser settings:
   - Ensure cookies/localStorage not blocked
   - Disable "Clear on exit" settings
   
2. Check for errors:
   - Open Console tab
   - Look for red errors
   - Check if Zustand persist is working

3. Verify Zustand persist:
```javascript
// Should return the storage object
console.log(localStorage.getItem('app-storage'));
```

## Quick Debug Script

Paste this in browser console to check everything:

```javascript
// Auth Debug Script
console.log('=== AUTH DEBUG ===');
console.log('Token exists:', !!localStorage.getItem('token'));
console.log('Token value:', localStorage.getItem('token')?.substring(0, 50) + '...');
console.log('App storage exists:', !!localStorage.getItem('app-storage'));

try {
  const storage = JSON.parse(localStorage.getItem('app-storage'));
  console.log('User:', storage?.state?.user);
  console.log('Token in storage:', !!storage?.state?.token);
  console.log('User role:', storage?.state?.user?.role);
} catch (e) {
  console.error('Failed to parse app-storage:', e);
}

console.log('=== END DEBUG ===');
```

## Test Different User Roles

### Test as Buyer:
1. Register with role: "Buyer"
2. Should redirect to `/buyer/dashboard`
3. Should see "My Projects" in navigation
4. Test creating a project

### Test as Solver:
1. Register with role: "Problem Solver"
2. Should redirect to `/solver/dashboard`
3. Should see "My Dashboard" and "Earnings" in navigation
4. Test browsing marketplace

## API Endpoint Tests

### Test these endpoints work with token:

**Solver Endpoints:**
```
GET /api/marketplace/my-applications
GET /api/solver/my-assignments
GET /api/solver/tasks
POST /api/marketplace/projects/{id}/apply
```

**Buyer Endpoints:**
```
GET /api/buyer/projects
POST /api/buyer/projects
GET /api/buyer/projects/{id}
PUT /api/buyer/projects/{id}
```

All should return 200 OK, not 403 Forbidden.

## Success Checklist

- [ ] Token saved after login
- [ ] Token saved after register
- [ ] Token persists after page reload
- [ ] API requests include Authorization header
- [ ] No 403 errors in console
- [ ] Dashboard loads successfully
- [ ] User info displayed in navigation
- [ ] Logout clears token
- [ ] Can login again after logout
- [ ] Different roles redirect correctly

## If All Tests Pass

Congratulations! Your authentication system is working correctly. You can now:
- Browse marketplace
- Apply to projects
- Create projects (as buyer)
- Manage tasks (as solver)
- View payments

## If Tests Fail

1. Check `TOKEN_AUTH_FIX.md` for detailed troubleshooting
2. Verify backend is running on `http://localhost:8000`
3. Check backend logs for errors
4. Ensure database has user records
5. Try with a fresh browser profile (incognito mode)
