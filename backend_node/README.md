# Lulimi Express Backend (MongoDB)

This is the live Express + MongoDB backend for Lulimi-Lingo. It stores user progress, serves curriculum data, and calls AI providers directly from the server.

Quick start

1. Install dependencies

```bash
cd backend_node
npm install
```

2. Copy `.env.example` to `.env` and update `MONGO_URI`, `OPENAI_API_KEY`, and `GEMINI_API_KEY` as needed.

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
- `POST /api/lesson` - generate lesson
- `POST /api/practice` - generate practice
- `POST /api/quiz` - generate quiz
- `POST /api/chat` - chat with tutor

This service is the active backend used by the frontend. AI generation is handled directly here through the configured provider keys.
