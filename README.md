# Project Marketplace Workflow

A comprehensive role-based project marketplace platform built with FastAPI and PostgreSQL, featuring a React frontend for smooth, animated UI.

## Features

### 1. **Role-Based Access Control**
- **Admin**: Assign roles, view all users and projects, manage platform
- **Buyer**: Create projects, review submissions, assign problem solvers
- **Problem Solver**: Browse projects, create tasks, submit work

### 2. **Core Workflow**
1. Admin assigns Buyer role to users
2. Buyer creates a project
3. Problem Solvers browse and request projects
4. Buyer selects and assigns one problem solver
5. Problem Solver creates tasks/sub-modules with metadata (title, description, deadline)
6. Problem Solver submits completed work as ZIP files
7. Buyer reviews and accepts/rejects submissions

### 3. **Project Lifecycle States**
- `OPEN`: Project created, waiting for problem solver requests
- `ASSIGNED`: Problem solver assigned to project
- `IN_PROGRESS`: Tasks being worked on
- `COMPLETED`: All tasks accepted
- `CANCELLED`: Project cancelled

### 4. **Task Management**
- Create multiple sub-modules/tasks per project
- Track task deadline and status
- Submit work as ZIP files
- Review submissions before acceptance

## Technology Stack

- **Backend**: FastAPI, Python 3.9+
- **Database**: PostgreSQL 12+
- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: JWT tokens with bcrypt
- **API Documentation**: Swagger UI (auto-generated)

## Project Structure

```
JOB2/
├── backend/
│   ├── app/
│   │   ├── core/              # Configuration, database, security
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── routes/            # API endpoints
│   │   └── main.py            # FastAPI application
│   ├── uploads/               # Uploaded ZIP files
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── api.js             # API client
    │   ├── store.js           # Zustand state management
    │   ├── App.jsx            # Main app component
    │   └── main.jsx           # Entry point
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Installation & Setup

### 1. Setup PostgreSQL Database

```bash
# Create a new database
createdb marketplace_db

# Or using psql
psql -U postgres -c "CREATE DATABASE marketplace_db;"
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Unix/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Update .env file with your database credentials
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Or with yarn
yarn install
```

## Running the Application

### 1. Start PostgreSQL
```bash
# Ensure PostgreSQL is running (platform-specific)
```

### 2. Start Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## API Documentation

### Authentication

**Register**
```
POST /api/auth/register
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "secure_password"
}
```

**Login**
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiL...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "user@example.com",
  "role": "problem_solver"
}
```

### Admin Routes

**Assign Buyer Role**
```
PATCH /api/admin/users/{user_id}/role
{
  "role": "buyer"
}
```

**Get All Users**
```
GET /api/admin/users?skip=0&limit=100
```

### Buyer Routes

**Create Project**
```
POST /api/buyer/projects
{
  "title": "Mobile App Development",
  "description": "Build an iOS app",
  "budget": 5000
}
```

**Get My Projects**
```
GET /api/buyer/projects
```

**Get Project Requests**
```
GET /api/buyer/projects/{project_id}/requests
```

**Assign Problem Solver**
```
POST /api/buyer/projects/{project_id}/assign
{
  "problem_solver_id": 5
}
```

### Problem Solver Routes

**Browse Available Projects**
```
GET /api/solver/projects
```

**Request Project**
```
POST /api/solver/projects/{project_id}/request
```

**Get My Assignments**
```
GET /api/solver/my-assignments
```

**Create Task**
```
POST /api/solver/tasks
{
  "title": "Backend API",
  "description": "Create RESTful API",
  "deadline": "2024-02-28"
}
```

**Submit Task (ZIP File)**
```
POST /api/solver/tasks/{task_id}/submit
(multipart/form-data with file field)
```

### Submission Review Routes

**Get Project Submissions**
```
GET /api/submissions/projects/{project_id}
```

**Review Submission**
```
POST /api/submissions/{submission_id}/review
{
  "status": "accepted",
  "rejection_reason": null
}
```

**Download Submission**
```
GET /api/submissions/{submission_id}/download
```

## Workflow Examples

### Admin Workflow
1. Login with admin account
2. Navigate to Admin Dashboard
3. View all users in a table
4. Click on a user and assign "Buyer" role
5. Monitor platform activity

### Buyer Workflow
1. Register as a problem solver (default role)
2. Ask admin to assign Buyer role
3. Create a new project with title, description, and budget
4. Wait for problem solver requests
5. Review incoming requests
6. Select and assign a problem solver
7. View project tasks and submissions
8. Review submitted work (download and check)
9. Accept or reject submissions with feedback

### Problem Solver Workflow
1. Register account
2. Browse available projects (OPEN status)
3. Click "Request Project" on desired projects
4. Wait for buyer assignment
5. Once assigned, create tasks/sub-modules
6. Add task details: title, description, deadline
7. Complete work and upload ZIP file
8. Check submission status (pending/accepted/rejected)
9. Resubmit if rejected

## Database Schema

### Users Table
- id, email, full_name, hashed_password, role, is_active, created_at, updated_at

### Projects Table
- id, title, description, budget, status, buyer_id, assigned_solver_id, created_at, updated_at

### Tasks Table
- id, project_id, problem_solver_id, title, description, deadline, status, created_at, updated_at

### Submissions Table
- id, task_id, problem_solver_id, file_path, file_name, status, rejection_reason, submitted_at, reviewed_at

### ProjectRequests Table
- id, project_id, problem_solver_id, status, requested_at, responded_at

## Environment Variables

**.env file** (backend):
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/marketplace_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Token Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

Tokens expire after 30 minutes (configurable in .env).

## Error Handling

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

## Future Enhancements

1. **Real-time Notifications**: WebSocket support for live updates
2. **Payment Integration**: Stripe/PayPal for project payments
3. **Ratings & Reviews**: Rate problem solvers and buyers
4. **Project Templates**: Pre-defined project types
5. **Advanced Filtering**: Filter projects by budget, timeline, etc.
6. **Analytics Dashboard**: Metrics and insights for admins
7. **Email Notifications**: Automated email alerts
8. **File Preview**: ZIP file content preview
9. **Version Control**: Track project version history
10. **Mobile App**: Native mobile applications

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb marketplace_db`

### Port Already in Use
```bash
# Backend running on different port
python -m uvicorn app.main:app --port 8001

# Frontend running on different port
npm run dev -- --port 3001
```

### CORS Errors
- Ensure frontend URL is in CORS whitelist (currently allows all origins)
- Update `app.main.py` CORS settings if needed

### File Upload Issues
- Ensure `/uploads` directory exists and is writable
- Check file size limits
- Verify file is a valid ZIP archive

## Support & Documentation

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **GitHub**: [Project Repository]

## License

MIT License - See LICENSE file for details
