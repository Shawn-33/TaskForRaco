# Database Connection Pool Fix

## Problem
```
sqlalchemy.exc.TimeoutError: QueuePool limit of size 5 overflow 10 reached, 
connection timed out, timeout 30.00
```

This error occurs when:
1. Database connections are not being properly closed
2. Connection pool is exhausted (all connections in use)
3. New requests can't get a connection within the timeout period

## Root Cause

The `get_db()` function in `backend/app/core/database.py` was using `return` instead of `yield`, which caused:
- Database sessions to close immediately
- Connections not being returned to the pool
- Connection leaks accumulating over time
- Pool exhaustion after ~15 requests

## Solution Applied

### 1. Fixed `get_db()` Function
**File: `backend/app/core/database.py`**

**Before (WRONG):**
```python
def get_db():
    """Database session dependency."""
    try:
        db = SessionLocal()
        return db  # ❌ Closes immediately!
    finally:
        db.close()
```

**After (CORRECT):**
```python
def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db  # ✅ Keeps connection open during request
    finally:
        db.close()  # ✅ Closes after request completes
```

### 2. Increased Connection Pool Size
**File: `backend/app/core/database.py`**

```python
engine = create_engine(
    settings.database_url, 
    echo=False,  # Reduced logging noise
    connect_args=connect_args,
    pool_size=10,  # Increased from default 5
    max_overflow=20,  # Increased from default 10
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)
```

**Configuration Explained:**
- `pool_size=10`: Normal pool size (10 connections ready)
- `max_overflow=20`: Can create 20 more connections if needed (total 30)
- `pool_pre_ping=True`: Tests connection before using (prevents stale connections)
- `pool_recycle=3600`: Recycles connections every hour (prevents long-lived connection issues)
- `echo=False`: Reduces console noise (was `echo=True`)

## How to Apply the Fix

### Step 1: Stop the Backend
Press `Ctrl+C` in the terminal running the backend, or:
```bash
# Windows
taskkill /F /IM python.exe

# Linux/Mac
pkill -f uvicorn
```

### Step 2: Verify the Fix
Check that `backend/app/core/database.py` has the correct code:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db  # Must use yield!
    finally:
        db.close()
```

### Step 3: Restart the Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided script:
```bash
restart_backend.bat
```

### Step 4: Test the Fix
1. Try logging in multiple times
2. Refresh pages repeatedly
3. Make multiple API calls
4. Should not see timeout errors anymore

## Why This Happens

### FastAPI Dependency Injection
FastAPI's `Depends()` expects a generator function (using `yield`):

```python
# Route using dependency
@router.post("/login")
def login(db: Session = Depends(get_db)):
    # db is available here
    user = db.query(User).first()
    return user
    # After return, FastAPI runs the finally block
```

**Flow with `yield`:**
1. Request comes in
2. FastAPI calls `get_db()`
3. `yield db` provides session to route
4. Route executes with session
5. Route returns response
6. FastAPI runs `finally` block
7. `db.close()` returns connection to pool ✅

**Flow with `return` (WRONG):**
1. Request comes in
2. FastAPI calls `get_db()`
3. `finally` runs immediately
4. `db.close()` called before route uses it ❌
5. Route tries to use closed session
6. Connection leaked, not returned to pool ❌

## Monitoring Connection Pool

### Check Current Connections
Add this endpoint to monitor pool status:

```python
# backend/app/routes/admin.py or create new file
from app.core.database import engine

@router.get("/pool-status")
def get_pool_status():
    pool = engine.pool
    return {
        "size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "total": pool.size() + pool.overflow()
    }
```

### Expected Values
- `checked_in`: Connections available in pool
- `checked_out`: Connections currently in use
- `overflow`: Extra connections created beyond pool_size
- Should see connections return to pool after requests

## Common Mistakes to Avoid

### ❌ Don't use `return` in `get_db()`
```python
def get_db():
    db = SessionLocal()
    return db  # WRONG!
```

### ❌ Don't create sessions manually in routes
```python
@router.get("/users")
def get_users():
    db = SessionLocal()  # WRONG! Use dependency injection
    users = db.query(User).all()
    return users
```

### ❌ Don't forget to close sessions in scripts
```python
# In init_db.py or other scripts
db = SessionLocal()
try:
    # Do work
    pass
finally:
    db.close()  # IMPORTANT!
```

### ✅ Always use dependency injection
```python
@router.get("/users")
def get_users(db: Session = Depends(get_db)):  # CORRECT!
    users = db.query(User).all()
    return users
```

## Testing the Fix

### Test 1: Multiple Logins
```bash
# Should not timeout
for i in {1..20}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
done
```

### Test 2: Concurrent Requests
Open multiple browser tabs and:
1. Login in each tab
2. Navigate to different pages
3. Refresh multiple times
4. Should not see timeout errors

### Test 3: Long Running Session
1. Login
2. Leave browser open for 10 minutes
3. Try to use the app
4. Should still work (connections recycled)

## Troubleshooting

### Still Getting Timeout Errors?

**Check 1: Verify the fix was applied**
```bash
grep -A 5 "def get_db" backend/app/core/database.py
```
Should show `yield db`, not `return db`

**Check 2: Restart backend completely**
```bash
# Kill all Python processes
taskkill /F /IM python.exe
# Start fresh
cd backend
python -m uvicorn app.main:app --reload
```

**Check 3: Check for manual SessionLocal() usage**
```bash
grep -r "SessionLocal()" backend/app/routes/
```
Should return nothing (all routes should use dependency injection)

**Check 4: Increase pool size further**
If you have many concurrent users:
```python
pool_size=20,
max_overflow=40,
```

### Database Locked Errors?

If using SQLite, add:
```python
connect_args={"check_same_thread": False}
```

### Connection Refused Errors?

Check database is running:
```bash
# PostgreSQL
pg_isready

# MySQL
mysqladmin ping
```

## Prevention

### Code Review Checklist
- [ ] All routes use `Depends(get_db)`
- [ ] No manual `SessionLocal()` in routes
- [ ] `get_db()` uses `yield`, not `return`
- [ ] Scripts close sessions in `finally` blocks
- [ ] Pool size appropriate for load

### Monitoring
Add logging to track connection usage:
```python
import logging
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    logger.info(f"DB session created: {id(db)}")
    try:
        yield db
    finally:
        logger.info(f"DB session closed: {id(db)}")
        db.close()
```

## Summary

✅ **Fixed:** `get_db()` now uses `yield` instead of `return`
✅ **Improved:** Increased connection pool size from 5 to 10
✅ **Enhanced:** Added pool_pre_ping and pool_recycle
✅ **Reduced:** Disabled echo to reduce log noise

The database connection pool should now handle requests properly without timing out!
