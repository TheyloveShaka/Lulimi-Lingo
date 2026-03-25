# Lulimi Express Backend (MongoDB)

This is a lightweight Express + MongoDB backend to store user progress and proxy AI endpoints.

Quick start

1. Install dependencies

```bash
cd backend_node
npm install
```

2. Copy `.env.example` to `.env` and update `MONGO_URI` and `PYTHON_BACKEND_URL` as needed.

3. Start the server

```bash
npm run dev
# or
npm start
```

Endpoints (initial)

- `POST /api/user` - create or upsert user
- `GET /api/progress/:userId` - get progress
- `POST /api/progress/:userId` - update progress
- `POST /api/lesson` - generate lesson (proxies to Python backend if configured)
- `POST /api/practice` - generate practice
- `POST /api/quiz` - generate quiz
- `POST /api/chat` - chat with tutor (proxies to Python backend if configured)

This service is intended to run alongside the existing Python backend during migration. AI generation currently proxies to the Python service when `PYTHON_BACKEND_URL` is set.
