# Testing Guide

## Unit Tests

### Setup Test Environment

```bash
cd backend
pip install pytest pytest-asyncio pytest-cov
```

### Backend Unit Tests

Create `backend/tests/test_auth.py`:
```python
import pytest
from app.core.security import verify_password, get_password_hash

def test_password_hashing():
    password = "testpassword123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)

def test_wrong_password():
    password = "testpassword123"
    hashed = get_password_hash(password)
    assert not verify_password("wrongpassword", hashed)
```

Create `backend/tests/test_models.py`:
```python
from app.models import User, UserRole

def test_user_creation():
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed",
        role=UserRole.PROBLEM_SOLVER
    )
    assert user.email == "test@example.com"
    assert user.role == UserRole.PROBLEM_SOLVER
```

### Run Unit Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

## Integration Tests

### API Testing

Create `backend/tests/test_api.py`:
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@example.com"

def test_login_user():
    # First register
    client.post(
        "/api/auth/register",
        json={
            "email": "testuser@example.com",
            "full_name": "Test User",
            "password": "password123"
        }
    )
    
    # Then login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_create_project():
    # Login first
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "buyer@test.com",
            "password": "buyer123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Create project
    response = client.post(
        "/api/buyer/projects",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Test Project",
            "description": "Test Description",
            "budget": 1000
        }
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Test Project"

def test_unauthorized_access():
    response = client.get("/api/admin/users")
    assert response.status_code == 403
```

### Run Integration Tests

```bash
# Run API tests
pytest tests/test_api.py -v

# Run with database (use test database)
pytest --database=test_db
```

## End-to-End Tests

### Selenium/Playwright Tests

```bash
pip install pytest-playwright
```

Create `frontend/tests/e2e.spec.js`:
```javascript
import { test, expect } from '@playwright/test';

test('Complete workflow', async ({ page }) => {
  // Navigate to login
  await page.goto('http://localhost:3000');
  
  // Register as buyer
  await page.fill('[name="fullName"]', 'Test Buyer');
  await page.fill('[name="email"]', 'buyer@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');
  
  // Wait for redirect
  await page.waitForNavigation();
  
  // Create project
  await page.click('button:has-text("New Project")');
  await page.fill('[name="title"]', 'Test Project');
  await page.fill('[name="description"]', 'Test Description');
  await page.click('[type="submit"]');
  
  // Verify project created
  await expect(page).toContainText('Test Project');
});
```

### Run E2E Tests

```bash
cd frontend
npx playwright test
```

## Performance Testing

### Load Testing with Apache JMeter

```bash
# Install JMeter
# Create test plan for API endpoints
# Run tests
jmeter -n -t test_plan.jmx -l results.jtl
```

### Load Testing with Locust

```bash
pip install locust
```

Create `locustfile.py`:
```python
from locust import HttpUser, task, between

class MarketplaceUser(HttpUser):
    wait_time = between(1, 5)
    
    @task
    def browse_projects(self):
        self.client.get("/api/solver/projects")
    
    @task
    def create_project(self):
        self.client.post(
            "/api/buyer/projects",
            json={
                "title": "Load Test Project",
                "description": "Test",
                "budget": 1000
            }
        )
```

Run tests:
```bash
locust -f locustfile.py --host=http://localhost:8000
```

## Manual Testing Scenarios

### Scenario 1: Admin Role Assignment

```
1. Login as admin (admin@test.com / admin123)
2. Navigate to Admin Dashboard
3. Find user in table
4. Click on user row
5. Change role dropdown to "Buyer"
6. Save changes
7. Verify role updated
8. Logout
```

### Scenario 2: Complete Buyer Workflow

```
1. Register new account (buyer2@test.com)
2. Ask admin to assign Buyer role
3. Login as buyer
4. Click "New Project"
5. Fill in project details:
   - Title: "Mobile App"
   - Description: "iOS and Android app"
   - Budget: 5000
6. Click Create
7. Verify project in list with OPEN status
8. Wait for solver requests (open another browser)
```

### Scenario 3: Problem Solver Request & Assignment

```
1. Login as problem solver (solver1@test.com)
2. Click "Browse Projects"
3. See the "Mobile App" project
4. Click "Request Project"
5. See confirmation message
6. Wait for buyer assignment...
7. (Buyer logs in and assigns this solver)
8. See project in "My Assignments"
9. Click "Manage Tasks"
10. Create first task
```

### Scenario 4: Task Creation & Submission

```
1. As problem solver in assigned project
2. Create task:
   - Title: "UI Design"
   - Description: "Create mockups"
   - Deadline: Select date
3. Create another task if desired
4. Work on tasks (locally)
5. Create task_demo.zip file
6. Click "Submit ZIP File" for first task
7. Upload file
8. Verify submission status changes to SUBMITTED
```

### Scenario 5: Buyer Review & Approval

```
1. Login as buyer
2. Click on project in list
3. Go to "Submissions" tab
4. See pending submissions
5. Click "Download" to review work
6. Check contents
7. Click "Accept" to approve
8. Or click "Reject" with feedback
9. Verify status updates
10. If rejected, solver can resubmit
```

## Testing Checklist

### Functionality
- [ ] User registration and login
- [ ] Admin role assignment
- [ ] Project creation (buyer)
- [ ] Project browsing (solver)
- [ ] Project requests and assignment
- [ ] Task creation and tracking
- [ ] File upload and submission
- [ ] Submission review and approval
- [ ] Role-based access control
- [ ] Error handling

### Security
- [ ] Invalid credentials rejected
- [ ] Unauthorized access blocked
- [ ] JWT token validation
- [ ] CSRF protection (if applicable)
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File type validation
- [ ] File size limits

### Performance
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Frontend load time < 3s
- [ ] Handle concurrent users
- [ ] Memory usage stable

### Browser Compatibility
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (WCAG AA)
- [ ] Form labels
- [ ] Error messages clear

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/test_db
        run: pytest
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Test Coverage Goals

- **Overall**: 80%+ coverage
- **Models**: 90%+ coverage
- **Routes**: 85%+ coverage
- **Authentication**: 95%+ coverage
- **Core Logic**: 90%+ coverage

## Debugging

### Enable Debug Logging

Backend:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Frontend:
```javascript
// In App.jsx
localStorage.setItem('debug', 'app:*');
```

### Database Debugging

```bash
# Connect to PostgreSQL
psql -U postgres -d marketplace_db

# View logs
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
```

### API Debugging

```bash
# Use curl for detailed requests
curl -v http://localhost:8000/api/...

# Use httpie for pretty output
http GET http://localhost:8000/api/admin/users \
  "Authorization: Bearer <token>"
```

## Troubleshooting Tests

### Tests Failing Locally
1. Check PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Clean up test database
4. Check for port conflicts
5. Review test logs for details

### Tests Passing Locally, Failing in CI
1. Check environment variables
2. Verify database setup in CI
3. Check Python/Node version compatibility
4. Review timing issues in async tests

### Performance Issues
1. Profile database queries
2. Check API response times
3. Monitor memory usage
4. Profile frontend rendering
5. Use performance monitoring tools
