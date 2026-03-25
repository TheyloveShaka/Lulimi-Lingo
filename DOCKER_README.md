# Docker Setup for Lulimi Lingo

This project is now fully containerized with Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- Min 2GB available RAM for containers

## Quick Start

### 1. Build and Start All Services

```bash
# Navigate to project root
cd c:\Users\DELL\Desktop\LLAi project

# Build and start all containers
docker-compose up --build
```

The first build may take 2-3 minutes as it installs dependencies and builds the frontend.

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Services Running

- `lulimi-frontend` - React app on port 3000
- `lulimi-backend` - Node.js API on port 5000
- `lulimi-mongodb` - MongoDB database on port 27017

## Common Docker Commands

### Start containers in background

```bash
docker-compose up -d
```

### Stop all containers

```bash
docker-compose down
```

### Stop and remove volumes (clear database)

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart a service

```bash
docker-compose restart backend
```

### Execute command in container

```bash
# Backend container
docker exec lulimi-backend npx mongoose-cli migrate

# MongoDB
docker exec lulimi-mongodb mongosh
```

## Environment Variables

Configure in `docker-compose.yml` or create `.env` file:

```env
JWT_SECRET=your-production-secret-key
VITE_NODE_BACKEND_URL=http://localhost:5000
```

For AI features, add API keys:

```env
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 27017 are already in use:

```bash
# Stop existing containers
docker-compose down

# Or change ports in docker-compose.yml
```

### MongoDB Connection Error

Ensure MongoDB is healthy:

```bash
docker-compose ps
docker-compose logs mongodb
```

### Frontend Can't Reach Backend

Check the backend logs and ensure it's running on port 5000:

```bash
docker-compose logs backend
```

### Clear Everything and Start Fresh

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Production Deployment

For production:

1. Update `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Update `CORS_ORIGIN` to your domain
4. Use proper MongoDB authentication
5. Add SSL/TLS with reverse proxy (Nginx/Traefik)
6. Use `.env` file for secrets (not in docker-compose.yml)

Example production docker-compose:

```yaml
environment:
  NODE_ENV: production
  MONGODB_URI: mongodb://username:password@mongodb:27017/lulimi-lingo
  JWT_SECRET: ${JWT_SECRET} # Use environment variable
  CORS_ORIGIN: ${CORS_ORIGIN}
```

## Development Mode

To run in development mode with hot reload:

```bash
# Start only MongoDB and Backend
docker-compose up -d mongodb backend

# Run frontend locally (outside container) for hot reload
cd frontend
npm install
npm run dev
```

## File Structure

```
project-root/
├── docker-compose.yml      # Orchestrates all services
├── frontend/
│   ├── Dockerfile          # Frontend build config
│   ├── .dockerignore       # Files to exclude from Docker
│   └── [React app files]
├── backend_node/
│   ├── Dockerfile          # Backend build config
│   ├── .dockerignore       # Files to exclude from Docker
│   └── [Express app files]
└── DOCKER_README.md        # This file
```
