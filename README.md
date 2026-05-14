# AI Education Platform Monorepo

A fully open-source AI-powered education ecosystem built with a modern microservices architecture.

## Architecture Overview

- `apps/web`: React + Vite web app with modern dashboards, community, AI tutoring, and analytics.
- `apps/mobile`: Flutter mobile app for Android and iOS with study planner, AI chat, and classroom features.
- `server/auth-service`: JWT authentication, role-based access control, teacher verification, and session history.
- `server/ai-service`: Local Ollama-powered tutoring, summaries, quizzes, flashcards, planner, and PDF ingestion scaffolding.
- `server/chat-service`: Socket.io realtime messaging, room presence, typing events, and chat storage.
- `server/notes-service`: Notes, PDF/video uploads, classroom resources, and study material CRUD.
- `server/community-service`: Community posts, comments, likes, private/public channels, and discussion APIs.
- `server/notification-service`: Live notification records, user alerts, announcements, and read/unread state.
- `redis`: Caching and realtime session support.
- `mongodb`: Document storage for users, content, and activity.
- `ollama`: Local model inference server for AI features.
- `nginx`: Reverse proxy for frontend and backend routing.

## Features

- Fully local AI stack with Ollama and open-source models.
- No paid APIs or proprietary cloud services required.
- Dockerized multi-container architecture.
- Secure JWT auth with teacher/student/parent/admin roles.
- Realtime chat, notifications, and community messaging.
- AI-generated quizzes, flashcards, summaries, and assignment scaffolding.
- Modern UX design ready for dark blue/purple themed dashboards.
- Mobile-first support through Flutter.

## Getting Started

1. Install workspace dependencies:
   ```bash
   npm install
   ```

2. Copy and update environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Start the full platform with Docker:
   ```bash
   docker-compose up --build
   ```

4. Open the app:
   - Web: `http://localhost`
   - Auth API: `http://localhost/api/auth`
   - AI API: `http://localhost/api/ai`

## Local Development

- Web app: `npm run dev:web`
- Backend services: `npm run dev:backend`
- Mobile app (Flutter): `npm run dev:mobile`

## Docker Services

- `nginx` - reverse proxy and frontend entrypoint
- `web` - React web app preview server
- `auth-service` - authentication microservice
- `ai-service` - AI orchestration microservice
- `chat-service` - realtime chat microservice
- `notes-service` - classroom content microservice
- `community-service` - forum and group microservice
- `notification-service` - notification microservice
- `mongodb` - open-source database storage
- `redis` - caching and realtime session support
- `ollama` - local AI model runtime

## Notes

- The system is designed for Linux/Fedora compatibility with Docker.
- All backend services are built in TypeScript and can scale independently.
- The Flutter mobile app is configured for Android and can be extended for offline content.
