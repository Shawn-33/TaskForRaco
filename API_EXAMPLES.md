# API Testing Examples

This file contains example API requests for testing the Project Marketplace.

## Base URL
```
http://localhost:8000
```

## Authentication Endpoints

### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "securepassword123"
}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "problem_solver",
  "is_active": true,
  "created_at": "2024-02-15T10:00:00"
}
```

### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "user@example.com",
  "role": "problem_solver"
}
```

## Admin Endpoints

### 1. Get All Users (Admin Only)
```
GET /api/admin/users?skip=0&limit=100
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "email": "admin@test.com",
    "full_name": "Admin User",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-02-15T10:00:00",
    "updated_at": "2024-02-15T10:00:00"
  },
  ...
]
```

### 2. Assign Role (Admin Only)
```
PATCH /api/admin/users/{user_id}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "buyer"
}

Response:
{
  "id": 2,
  "email": "buyer@example.com",
  "full_name": "Test Buyer",
  "role": "buyer",
  "is_active": true,
  "created_at": "2024-02-15T10:00:00",
  "updated_at": "2024-02-15T11:30:00"
}
```

### 3. Deactivate User (Admin Only)
```
POST /api/admin/users/{user_id}/deactivate
Authorization: Bearer <admin_token>

Response:
{
  "message": "User user@example.com has been deactivated"
}
```

## Buyer Endpoints

### 1. Create Project (Buyer Only)
```
POST /api/buyer/projects
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "title": "Mobile App Development",
  "description": "Build a cross-platform mobile application with React Native",
  "budget": 5000
}

Response:
{
  "id": 1,
  "title": "Mobile App Development",
  "description": "Build a cross-platform mobile application with React Native",
  "budget": 5000,
  "status": "open",
  "buyer_id": 2,
  "assigned_solver_id": null,
  "created_at": "2024-02-15T12:00:00",
  "updated_at": "2024-02-15T12:00:00"
}
```

### 2. Get My Projects (Buyer Only)
```
GET /api/buyer/projects?skip=0&limit=100
Authorization: Bearer <buyer_token>

Response:
[
  {
    "id": 1,
    "title": "Mobile App Development",
    "description": "Build a cross-platform mobile application with React Native",
    "budget": 5000,
    "status": "open",
    "buyer_id": 2,
    "assigned_solver_id": null,
    "created_at": "2024-02-15T12:00:00",
    "updated_at": "2024-02-15T12:00:00"
  }
]
```

### 3. Get Project Details (Buyer Only)
```
GET /api/buyer/projects/{project_id}
Authorization: Bearer <buyer_token>

Response:
{
  "id": 1,
  "title": "Mobile App Development",
  "description": "Build a cross-platform mobile application with React Native",
  "budget": 5000,
  "status": "open",
  "buyer_id": 2,
  "assigned_solver_id": null,
  "created_at": "2024-02-15T12:00:00",
  "updated_at": "2024-02-15T12:00:00",
  "requests": [],
  "tasks": []
}
```

### 4. Update Project (Buyer Only)
```
PATCH /api/buyer/projects/{project_id}
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "budget": 6000
}

Response:
{
  "id": 1,
  "title": "Updated Title",
  "description": "Build a cross-platform mobile application with React Native",
  "budget": 6000,
  "status": "open",
  "buyer_id": 2,
  "assigned_solver_id": null,
  "created_at": "2024-02-15T12:00:00",
  "updated_at": "2024-02-15T12:30:00"
}
```

### 5. Get Project Requests (Buyer Only)
```
GET /api/buyer/projects/{project_id}/requests
Authorization: Bearer <buyer_token>

Response:
[
  {
    "id": 1,
    "project_id": 1,
    "problem_solver_id": 3,
    "status": "pending",
    "requested_at": "2024-02-15T13:00:00",
    "responded_at": null
  }
]
```

### 6. Assign Problem Solver (Buyer Only)
```
POST /api/buyer/projects/{project_id}/assign
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "problem_solver_id": 3
}

Response:
{
  "message": "Problem solver assigned successfully",
  "project": {
    "id": 1,
    "title": "Mobile App Development",
    "description": "Build a cross-platform mobile application with React Native",
    "budget": 5000,
    "status": "assigned",
    "buyer_id": 2,
    "assigned_solver_id": 3,
    "created_at": "2024-02-15T12:00:00",
    "updated_at": "2024-02-15T13:30:00"
  }
}
```

## Problem Solver Endpoints

### 1. Browse Available Projects
```
GET /api/solver/projects?skip=0&limit=100
Authorization: Bearer <solver_token>

Response:
[
  {
    "id": 1,
    "title": "Mobile App Development",
    "description": "Build a cross-platform mobile application with React Native",
    "budget": 5000,
    "status": "open",
    "buyer_id": 2,
    "assigned_solver_id": null,
    "created_at": "2024-02-15T12:00:00",
    "updated_at": "2024-02-15T12:00:00"
  }
]
```

### 2. Request Project
```
POST /api/solver/projects/{project_id}/request
Authorization: Bearer <solver_token>

Response:
{
  "message": "Request submitted successfully",
  "project": {
    "id": 1,
    "title": "Mobile App Development",
    "description": "Build a cross-platform mobile application with React Native",
    "budget": 5000,
    "status": "open",
    "buyer_id": 2,
    "assigned_solver_id": null,
    "created_at": "2024-02-15T12:00:00",
    "updated_at": "2024-02-15T12:00:00"
  }
}
```

### 3. Get My Assignments
```
GET /api/solver/my-assignments
Authorization: Bearer <solver_token>

Response:
[
  {
    "id": 1,
    "title": "Mobile App Development",
    "description": "Build a cross-platform mobile application with React Native",
    "budget": 5000,
    "status": "assigned",
    "buyer_id": 2,
    "assigned_solver_id": 3,
    "created_at": "2024-02-15T12:00:00",
    "updated_at": "2024-02-15T13:30:00"
  }
]
```

### 4. Create Task (After Assignment)
```
POST /api/solver/tasks
Authorization: Bearer <solver_token>
Content-Type: application/json

{
  "title": "UI/UX Design",
  "description": "Create mobile app interface designs",
  "deadline": "2024-03-15"
}

Response:
{
  "id": 1,
  "project_id": 1,
  "problem_solver_id": 3,
  "title": "UI/UX Design",
  "description": "Create mobile app interface designs",
  "deadline": "2024-03-15",
  "status": "created",
  "created_at": "2024-02-15T14:00:00",
  "updated_at": "2024-02-15T14:00:00"
}
```

### 5. Get My Tasks
```
GET /api/solver/tasks
Authorization: Bearer <solver_token>

Response:
[
  {
    "id": 1,
    "project_id": 1,
    "problem_solver_id": 3,
    "title": "UI/UX Design",
    "description": "Create mobile app interface designs",
    "deadline": "2024-03-15",
    "status": "created",
    "created_at": "2024-02-15T14:00:00",
    "updated_at": "2024-02-15T14:00:00"
  }
]
```

### 6. Update Task
```
PATCH /api/solver/tasks/{task_id}
Authorization: Bearer <solver_token>
Content-Type: application/json

{
  "title": "Updated UI/UX Design",
  "status": "in_progress"
}

Response:
{
  "id": 1,
  "project_id": 1,
  "problem_solver_id": 3,
  "title": "Updated UI/UX Design",
  "description": "Create mobile app interface designs",
  "deadline": "2024-03-15",
  "status": "in_progress",
  "created_at": "2024-02-15T14:00:00",
  "updated_at": "2024-02-15T14:30:00"
}
```

### 7. Submit Task (ZIP File)
```
POST /api/solver/tasks/{task_id}/submit
Authorization: Bearer <solver_token>
Content-Type: multipart/form-data

file: <upload_file.zip>

Response:
{
  "message": "Task submitted successfully",
  "submission_id": 1,
  "file_name": "upload_file.zip"
}
```

## Submission Review Endpoints

### 1. Get Project Submissions (Buyer Only)
```
GET /api/submissions/projects/{project_id}
Authorization: Bearer <buyer_token>

Response:
[
  {
    "id": 1,
    "task_id": 1,
    "problem_solver_id": 3,
    "file_name": "ui_designs.zip",
    "file_path": "uploads/task_1_ui_designs.zip",
    "status": "pending",
    "rejection_reason": null,
    "submitted_at": "2024-02-15T15:00:00",
    "reviewed_at": null
  }
]
```

### 2. Get Submission Details (Buyer Only)
```
GET /api/submissions/{submission_id}
Authorization: Bearer <buyer_token>

Response:
{
  "id": 1,
  "task_id": 1,
  "problem_solver_id": 3,
  "file_name": "ui_designs.zip",
  "file_path": "uploads/task_1_ui_designs.zip",
  "status": "pending",
  "rejection_reason": null,
  "submitted_at": "2024-02-15T15:00:00",
  "reviewed_at": null
}
```

### 3. Accept Submission (Buyer Only)
```
POST /api/submissions/{submission_id}/review
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "status": "accepted",
  "rejection_reason": null
}

Response:
{
  "message": "Submission accepted successfully",
  "submission": {
    "id": 1,
    "task_id": 1,
    "problem_solver_id": 3,
    "file_name": "ui_designs.zip",
    "file_path": "uploads/task_1_ui_designs.zip",
    "status": "accepted",
    "rejection_reason": null,
    "submitted_at": "2024-02-15T15:00:00",
    "reviewed_at": "2024-02-15T15:30:00"
  }
}
```

### 4. Reject Submission (Buyer Only)
```
POST /api/submissions/{submission_id}/review
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "status": "rejected",
  "rejection_reason": "Colors don't match brand guidelines"
}

Response:
{
  "message": "Submission rejected successfully",
  "submission": {
    "id": 1,
    "task_id": 1,
    "problem_solver_id": 3,
    "file_name": "ui_designs.zip",
    "file_path": "uploads/task_1_ui_designs.zip",
    "status": "rejected",
    "rejection_reason": "Colors don't match brand guidelines",
    "submitted_at": "2024-02-15T15:00:00",
    "reviewed_at": "2024-02-15T15:30:00"
  }
}
```

### 5. Download Submission (Buyer Only)
```
GET /api/submissions/{submission_id}/download
Authorization: Bearer <buyer_token>

Response: (ZIP file binary content)
```

## Using cURL for Testing

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "solver@test.com",
    "full_name": "Test Solver",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "solver@test.com",
    "password": "password123"
  }'
```

### Create Project (with token)
```bash
curl -X POST http://localhost:8000/api/buyer/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "Test Description",
    "budget": 1000
  }'
```

### Upload File
```bash
curl -X POST http://localhost:8000/api/solver/tasks/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@your_file.zip"
```
