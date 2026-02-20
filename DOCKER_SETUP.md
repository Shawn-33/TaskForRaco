# Docker Setup with Auto-Initialization

## Overview

The Docker setup now automatically initializes the database with test data when the backend container starts for the first time.

## How It Works

### 1. Entrypoint Script (`backend/entrypoint.sh`)

The entrypoint script handles the initialization process:

1. **Waits for Database**: Ensures PostgreSQL is ready
2. **Checks Database Status**: Queries if users already exist
3. **Conditional Initialization**: 
   - If database is empty → Runs `init_db.py`
   - If database has data → Skips initialization
4. **Starts Server**: Launches FastAPI with uvicorn

### 2. Dockerfile Updates (`Dockerfile.backend`)

- Copies `init_db.py` and `entrypoint.sh` into the container
- Makes entrypoint script executable
- Sets entrypoint as the default command

### 3. Docker Compose Configuration (`docker-compose.yml`)

- Backend depends on database health check
- Environment variables configured for PostgreSQL
- Volumes mounted for persistent uploads

## Usage

### Start the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View database logs only
docker-compose logs -f db
```

### Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Rebuild After Changes

```bash
# Rebuild backend only
docker-compose up --build backend

# Rebuild everything
docker-compose up --build
```

## Test Credentials

After initialization, the following test accounts are available:

### Admin Account
- **Email**: admin@test.com
- **Password**: admin123
- **Role**: Admin

### Buyer Accounts
- **Email**: buyer@test.com
- **Password**: buyer123
- **Role**: Buyer

- **Email**: buyer2@test.com
- **Password**: buyer123
- **Role**: Buyer

### Solver Accounts
- **Email**: solver1@test.com
- **Password**: solver123
- **Role**: Problem Solver

- **Email**: solver2@test.com
- **Password**: solver123
- **Role**: Problem Solver

- **Email**: solver3@test.com
- **Password**: solver123
- **Role**: Problem Solver

## Services

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Container**: marketplace_backend

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Container**: marketplace_frontend

### Database (PostgreSQL)
- **Host**: localhost
- **Port**: 5433
- **Database**: marketplace_db
- **User**: postgres
- **Password**: postgres
- **Container**: marketplace_db

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Reinitialization Needed

To reinitialize the database:

```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up --build
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Rebuild backend
docker-compose up --build backend
```

## Development Workflow

### Making Backend Changes

1. Edit files in `backend/` directory
2. Backend will auto-reload (uvicorn --reload)
3. No rebuild needed for code changes

### Making Frontend Changes

1. Edit files in `frontend/` directory
2. Frontend will auto-reload (Next.js dev server)
3. No rebuild needed for code changes

### Database Schema Changes

1. Update models in `backend/app/models/`
2. Stop containers: `docker-compose down -v`
3. Rebuild: `docker-compose up --build`

## Production Considerations

For production deployment:

1. **Remove `--reload` flag** from uvicorn command
2. **Change SECRET_KEY** in environment variables
3. **Use production database** (not test data)
4. **Set up proper SSL/TLS** certificates
5. **Configure CORS** properly
6. **Use environment-specific** `.env` files
7. **Set up monitoring** and logging
8. **Use production-grade** web server (nginx)

## File Structure

```
.
├── docker-compose.yml          # Docker services configuration
├── Dockerfile.backend          # Backend container definition
├── Dockerfile.frontend         # Frontend container definition
├── backend/
│   ├── entrypoint.sh          # Backend startup script
│   ├── init_db.py             # Database initialization
│   ├── app/                   # FastAPI application
│   └── uploads/               # File uploads (mounted volume)
└── frontend/
    └── src/                   # Next.js application
```

## Notes

- Database data persists in Docker volume `postgres_data`
- Uploads directory is mounted for file persistence
- Backend runs on port 8000
- Frontend runs on port 3000
- Database runs on port 5433 (mapped from 5432)
- All services are on the same Docker network
