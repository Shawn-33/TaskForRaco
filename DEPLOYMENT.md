# Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- PostgreSQL database (or use Docker Compose)
- SSL certificate (for production)

## Local Deployment with Docker Compose

### 1. Build and Start Services
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and start FastAPI backend
- Build and start React frontend
- Create necessary volumes

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Initialize Database
```bash
# The database will be automatically created by Docker
# Access the backend container to run init_db.py if needed
docker exec marketplace_backend python init_db.py
```

### 4. Stop Services
```bash
docker-compose down
```

## Production Deployment

### 1. Environment Setup

**Update docker-compose.yml:**
```yaml
environment:
  DATABASE_URL: postgresql://user:password@postgres:5432/marketplace_db
  SECRET_KEY: your-production-secret-key
  ALGORITHM: HS256
  ACCESS_TOKEN_EXPIRE_MINUTES: 30
```

### 2. Nginx Reverse Proxy

Create `nginx.conf`:
```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    # API endpoints
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone your-repo-url
cd JOB2

# Update environment variables
nano docker-compose.yml

# Start services
docker-compose up -d
```

### 4. Google Cloud Run (Backend Only)

```bash
# Build and push to Cloud Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/marketplace-backend

# Deploy
gcloud run deploy marketplace-backend \
  --image gcr.io/PROJECT-ID/marketplace-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=your-connection-string
```

### 5. Heroku Deployment (Alternative)

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Deploy
git push heroku main

# Run migrations
heroku run python init_db.py
```

## Database Configuration

### Using Managed Database Services

**AWS RDS:**
```yaml
DATABASE_URL: postgresql://user:password@your-rds-endpoint:5432/marketplace_db
```

**Google Cloud SQL:**
```yaml
DATABASE_URL: postgresql://user:password@your-cloudsql-endpoint:5432/marketplace_db
```

**Azure Database for PostgreSQL:**
```yaml
DATABASE_URL: postgresql://user:password@your-server.postgres.database.azure.com:5432/marketplace_db
```

## Monitoring & Logging

### Docker Logs
```bash
# Backend logs
docker logs marketplace_backend

# Frontend logs
docker logs marketplace_frontend

# Database logs
docker logs marketplace_db
```

### Health Checks
```bash
# Check backend health
curl http://localhost:8000/health

# Check API availability
curl http://localhost:8000/docs
```

### Log Aggregation (Optional)
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Scaling Considerations

1. **Database Scaling**
   - Use read replicas for database
   - Implement connection pooling (PgBouncer)
   - Archive old submissions to S3

2. **Backend Scaling**
   - Use Kubernetes for container orchestration
   - Load balancing with Nginx or AWS ALB
   - Cache API responses with Redis

3. **File Storage**
   - Move uploads to S3/GCS
   - Implement file cleanup policies
   - Use CDN for delivery

4. **Frontend Optimization**
   - Implement code splitting
   - Use lazy loading
   - Compress assets
   - Cache static files

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use secret management services
   - Rotate secrets regularly

2. **Database**
   - Enable SSL/TLS connections
   - Use strong passwords
   - Implement IP whitelisting
   - Regular backups

3. **API**
   - Enable CORS only for trusted origins
   - Implement rate limiting
   - Use API keys for sensitive endpoints
   - Regular security audits

4. **SSL/TLS**
   - Use Let's Encrypt for free certificates
   - Enable automatic renewal
   - Use strong ciphers

## Backup & Recovery

### Database Backup
```bash
# Automated daily backup
0 2 * * * pg_dump marketplace_db | gzip > /backups/marketplace_$(date +\%Y\%m\%d).sql.gz
```

### File Backup
```bash
# Backup uploads directory
0 3 * * * tar -czf /backups/uploads_$(date +\%Y\%m\%d).tar.gz ./uploads/
```

## Performance Tuning

### PostgreSQL
```sql
-- Connection pooling
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

-- Optional indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_submissions_status ON submissions(status);
```

### Application
```python
# Add caching
from functools import lru_cache

@lru_cache(maxsize=128)
def get_project_details(project_id: int):
    pass
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and Push Docker images
        run: |
          docker build -t marketplace-backend -f Dockerfile.backend .
          docker push marketplace-backend
      
      - name: Deploy to production
        run: |
          # Your deployment commands
```

## Troubleshooting

### Container Issues
```bash
# Check container status
docker ps -a

# View detailed logs
docker logs --tail=100 marketplace_backend

# Execute command in container
docker exec -it marketplace_backend bash
```

### Database Connection Issues
```bash
# Check database connectivity
docker exec marketplace_backend psql -h db -U postgres -d marketplace_db -c "SELECT 1"
```

### Port Conflicts
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

## Support

For deployment issues, check:
- Docker logs
- Application error logs
- Database connection strings
- Firewall/Security group rules
- SSL certificate validity
