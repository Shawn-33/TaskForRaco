# 🔧 Troubleshooting Guide

## Backend Issues

### Port 8000 Already in Use
```bash
# Find and kill process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :8000
kill -9 <PID>
```

### Database Connection Error
```python
# Error: Could not connect to database
# Solution:
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env is correct
3. Ensure database exists: createdb marketplace_db
4. Run migrations: python init_db.py
```

### Import Errors
```bash
# Error: No module named 'stripe'
# Solution:
pip install -r requirements.txt
pip install --upgrade pip
```

### SQLAlchemy Table Already Exists
```python
# Error: (psycopg2.errors.DuplicateTable)
# Solution:
# Option 1: Drop and recreate database
dropdb marketplace_db
createdb marketplace_db
python init_db.py

# Option 2: Use alembic for migrations
alembic init migrations
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

## Frontend Issues

### node_modules Issues
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Port 3000 Already in Use
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### API Connection Errors

**Error:** `Cannot find module '@/lib/api'`
```bash
# Solution: Ensure tsconfig.json paths are correct
# Check: "baseUrl": ".", "@/*": ["./src/*"]
```

**Error:** `GET http://localhost:8000/api... 404`
```bash
# Solutions:
1. Verify backend is running: http://localhost:8000/docs
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Ensure backend routes are registered in main.py
4. Check CORS settings in FastAPI app
```

**Error:** `TypeError: apiClient.getProjectApplications is not a function`
```bash
# Solution: Add the method to lib/api.ts if missing
# Verify all API client methods are implemented
```

### Build Errors
```bash
# Error: TypeScript compilation error
# Solution:
npm run lint
# Fix any TypeScript errors shown
npm run build
npm run dev
```

### Stripe Integration Not Working

**Test key not set:**
```bash
# .env.local should have:
NEXT_PUBLIC_STRIPE_KEY=pk_test_... (not pk_live_)
```

**Payment form not showing:**
```bash
# Ensure StripeProvider wraps your component
# Check: src/app/providers.tsx includes StripeProvider
```

---

## Database Issues

### PostgreSQL Not Running

**Windows:**
```powershell
# Start PostgreSQL service
net start postgresql-14
# Or use Services app to start

# Check if running:
pg_isready
```

**Mac:**
```bash
# With Homebrew:
brew services start postgresql

# Check status:
brew services list
```

**Linux:**
```bash
# Start service:
sudo service postgresql start
# Or:
sudo systemctl start postgresql
```

### Cannot Create Database
```bash
# Error: FATAL: Ident authentication failed
# Solution 1: Switch to postgres user
sudo -i
su postgres
createdb marketplace_db

# Solution 2: Update pg_hba.conf
# Change: ident -> md5 (or trust for development)
# Restart PostgreSQL
```

### Database URL Format
```
# Correct format:
postgresql://username:password@localhost:5432/database_name

# If spaces in password, URL encode:
postgresql://user:pass%40word@localhost:5432/db

# Alternative:
postgresql+psycopg2://user:password@localhost/db
```

---

## Stripe Issues

### Stripe Key Errors

**Error:** `Invalid API Key`
```bash
# Check:
1. Key starts with sk_test_ (backend) or pk_test_ (frontend)
2. Key is complete (not truncated in .env)
3. Key is correct for your Stripe account
4. Not mixing test and live keys
```

**Error:** `No API key provided`
```python
# Backend:
# Ensure in routes/payment.py:
api_key = os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = api_key

# Frontend:
# Ensure in .env.local:
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
```

### Payment Intent Failed

**Error:** `Missing required param: currency`
```python
# Check amount is integer in cents:
stripe.PaymentIntent.create(
    amount=int(amount_in_dollars * 100),  # ✅ Correct
    currency="usd",
    ...
)
```

**Error:** `Invalid amount`
```python
# Amount must be >= 50 cents = $0.50
amount_cents = int(amount_dollars * 100)
if amount_cents < 50:
    raise ValueError("Minimum amount is $0.50")
```

---

## Authorization Issues

### 401 Unauthorized

**Frontend:**
```typescript
// Check token is persisted:
1. Open DevTools > Application > localStorage
2. Look for 'token' key
3. Verify token is valid JWT

// Solution:
localStorage.removeItem('token');
// Then login again
```

**Backend:**
```python
# Check JWT validation in dependencies.py
token = credentials.credentials
payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
# Verify token is not expired
```

### 403 Forbidden

**Cause:** User role doesn't have permission
```python
# Example: Only buyers can create projects
if current_user.role != UserRole.BUYER:
    raise HTTPException(status_code=403, detail="Only buyers...")
```

**Solution:** Verify you're logged in with correct role
1. Check /api/auth/me returns correct role
2. Test with buyer account for buyer endpoints
3. Test with solver account for solver endpoints

---

## Performance Issues

### Slow API Responses

**Check:**
```bash
# 1. Database queries
# Add print statements in route handlers to check query time

# 2. Network latency
# Open browser DevTools > Network tab
# Check response time for endpoints

# 3. Index missing columns
# Verify database indexes on frequently queried columns
```

**Solutions:**
```sql
-- Add index for project status queries
CREATE INDEX idx_project_status ON projects(status);

-- Add index for user id queries
CREATE INDEX idx_project_buyer_id ON projects(buyer_id);
```

### Memory Leaks

**Check for:**
```javascript
// Not cleaning up useEffect hooks
useEffect(() => {
  const fetchData = async () => { ... };
  fetchData();
  
  // ❌ Missing cleanup
  // ✅ Should return cleanup function if needed
}, []);

// Not unsubscribing from APIs
// Solution: Use proper cleanup patterns
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `404 Not Found` | Route doesn't exist | Check API endpoint spelling |
| `500 Internal Server Error` | Backend crash | Check backend logs |
| `CORS error` | Cross-origin issue | Check CORS settings in FastAPI |
| `Validation error` | Bad request data | Check request body schema |
| `Unique constraint violation` | Duplicate entry | Check for duplicates in database |
| `Foreign key error` | Related record missing | Ensure parent record exists |

---

## Debug Mode

### Backend Debugging

```python
# Add debug prints
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    logger.debug("Fetching projects...")
    projects = db.query(Project).all()
    logger.debug(f"Found {len(projects)} projects")
    return projects
```

### Frontend Debugging

```javascript
// Add console logs
console.log('API Response:', response.data);
console.log('User Store:', useAppStore.getState());

// Use React DevTools Chrome extension
// Check component props and state

// Use Network tab in DevTools
// Inspect request/response headers and body
```

### Database Debugging

```bash
# Connect directly to database
psql -U username -d marketplace_db

# Useful queries:
SELECT * FROM users;
SELECT * FROM projects WHERE status = 'open';
SELECT * FROM project_requests WHERE project_id = 1;

# Check table structure:
\dt  # List tables
\d projects  # Describe projects table
```

---

## Getting Help

1. **Check Logs:**
   - Backend: Uvicorn console output
   - Frontend: Browser console (F12)
   - Database: PostgreSQL logs

2. **Verify Configuration:**
   - Check .env files have all required variables
   - Verify services are running (PostgreSQL, Redis if used)
   - Confirm ports are available

3. **Test Endpoints:**
   - Use Postman/Insomnia for API testing
   - Visit http://localhost:8000/docs for API docs
   - Check response status codes

4. **Reset Everything:**
   ```bash
   # Complete reset:
   1. Kill all servers
   2. Drop database: dropdb marketplace_db
   3. Recreate: createdb marketplace_db
   4. Reinitialize: python init_db.py
   5. Clear frontend cache: rm -rf .next node_modules
   6. Reinstall: npm install
   7. Start fresh
   ```

---

**If issues persist, check the full logs and share the error message for more specific help!**
