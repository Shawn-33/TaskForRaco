# Quick Start Guide

## Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+

## Installation

### Windows
```bash
.\setup.bat
```

### Linux/macOS
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

## Database Setup

```bash
# Create database
createdb marketplace_db

# Or using PostgreSQL CLI
psql -U postgres
postgres=# CREATE DATABASE marketplace_db;
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output should show:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Output should show:**
```
VITE v5.0.0  ready in 123 ms
Local:   http://localhost:3000/
```

## Access Points

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Test Users

### Create Test Accounts

1. Visit http://localhost:3000
2. Sign up with test email and password
3. Login

### Test Workflow

**Step 1: Admin Setup**
1. Create first account with email: admin@test.com
2. Access database and manually set role to 'admin':
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
   ```

**Step 2: Buyer Account**
1. Create account: buyer@test.com
2. As admin, assign Buyer role to this user

**Step 3: Problem Solver Accounts**
1. Create accounts: solver1@test.com, solver2@test.com

**Step 4: Test Workflow**
1. Login as buyer
2. Create a project
3. Logout and login as solver1
4. Browse and request the project
5. Logout and login as buyer
6. Accept the solver's request
7. Logout and login as solver1
8. Create tasks and submit work

## Database Access

### Using psql
```bash
psql -U postgres -d marketplace_db

# View tables
\dt

# View users
SELECT * FROM users;

# View projects
SELECT * FROM projects;
```

## Troubleshooting

**Port 8000 already in use:**
```bash
python -m uvicorn app.main:app --reload --port 8001
```

**Port 3000 already in use:**
```bash
npm run dev -- --port 3001
```

**Database connection error:**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in backend/.env
# Ensure database exists: createdb marketplace_db
```

**Clear frontend cache:**
```bash
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get All Projects (with token)
```bash
curl -X GET http://localhost:8000/api/buyer/projects \
  -H "Authorization: Bearer <token>"
```

## Next Steps

- Review API documentation at http://localhost:8000/docs
- Explore role-specific workflows in the README.md
- Customize styling and components as needed
- Deploy to production (see deployment guide)
