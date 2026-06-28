# Lulimi-Lingo: Complete Project Architecture & File Structure

A modern, gamified language-learning platform for Uganda's local languages, powered by AI. This document explains the entire project structure, technology stack, and what each file/folder does.

---

## 🏗️ Project Overview

**Lulimi-Lingo** is a full-stack learning app built around one active API path:

- **Frontend**: React 18 + Vite for the student experience
- **Active backend**: Express.js + MongoDB in `backend_node/` for users, progress, curriculum, caching, and AI orchestration

The app helps S1-S4 students learn Ugandan local languages through gamified lessons, quizzes, and practice exercises. The main design goal is to keep the UI fast while letting the Node backend control the live API contract.

## What, Why, How

- **What**: A curriculum-based language learning platform with lessons, quizzes, practice, progress tracking, and AI tutoring.
- **Why**: To give learners a guided path through Uganda's local languages without making them jump between disconnected tools or manual content.
- **How**: The frontend sends requests to `backend_node`, that server validates and caches the request, then it calls OpenAI or Gemini directly and returns structured JSON the UI can render.

---

## 📁 Root Directory Structure

```
LLAi project/
├── frontend/                          # React web application
├── backend_node/                      # Node.js/Express API server
├── docker-compose.yml                 # Docker orchestration
├── Dockerfile                         # Container definition
├── Procfile                           # Railway deployment config
├── railway.json                       # Railway settings
├── vercel.json                        # Vercel deployment config
├── README.md                          # Main project overview
├── CONTAINERIZATION_COMPLETE.md       # Docker setup documentation
├── DOCKER_README.md                   # Docker usage guide
├── RAILWAY_DEPLOYMENT.md              # Railway deployment guide
├── RESPONSIVE_FIXES.md                # UI responsive fixes log
├── start.sh                           # Linux startup script
├── start-docker.ps1                   # Windows Docker startup script
├── smoke_test_api.ps1                 # API testing script
```

---

## 🎨 Frontend Structure (`/frontend`)

**Purpose**: React-based UI for students, built with Vite for fast development and modern bundling.

### Frontend Directory Layout

```
frontend/
├── src/
│   ├── App.jsx                        # Root component
│   ├── main.jsx                       # Vite entry point
│   ├── components/
│   │   ├── landing/
│   │   │   ├── HeroSection.jsx        # Hero banner with intro
│   │   │   ├── SignupCard.jsx         # User registration form
│   │   │   └── InfoSection.jsx        # Features/benefits section
│   │   ├── dashboard/
│   │   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   │   ├── LevelLadder.jsx        # Candy Crush-style level display
│   │   │   ├── WeekModal.jsx          # Week selection modal
│   │   │   ├── ChatbotDock.jsx        # AI chatbot widget
│   │   │   └── ProgressTracker.jsx    # User progress visualization
│   │   └── learning/
│   │       ├── LessonView.jsx         # Displays AI-generated lessons
│   │       ├── LessonView.css         # Lesson styling
│   │       ├── QuizView.jsx           # Interactive quiz component
│   │       ├── QuizView.css           # Quiz styling
│   │       ├── PracticeView.jsx       # Practice exercises display
│   │       └── PracticeView.css       # Practice styling
│   ├── pages/
│   │   ├── LandingPage.jsx            # Public landing page
│   │   ├── Dashboard.jsx              # Main app dashboard
│   │   ├── LessonPage.jsx             # Lesson learning view
│   │   ├── PracticePage.jsx           # Practice exercises page
│   │   └── QuizPage.jsx               # Quiz/assessment page
│   ├── services/
│   │   ├── aiService.js               # Calls backend API, validates AI responses
│   │   ├── authService.js             # User authentication logic
│   │   ├── progressService.js         # Fetches/updates user progress
│   │   └── curriculumService.js       # Loads curriculum data
│   ├── context/
│   │   └── LearningContext.jsx        # Global state management for learning data
│   ├── data/
│   │   ├── curriculumData.js          # Hardcoded curriculum structure
│   │   ├── syllabus2.json             # Syllabus data (S1-S4)
│   │   └── syllabusContent.json       # Detailed topic content
│   ├── styles/
│   │   ├── global.css                 # Global CSS variables, animations
│   │   └── [component styles]         # Component-specific CSS files
│   ├── config/
│   │   └── aiPrompts.json             # AI prompt templates
│   └── images/                        # Image assets
├── public/
│   ├── images/                        # Static images
│   └── favicon.ico                    # Favicon
├── index.html                         # HTML entry point
├── vite.config.js                     # Vite build configuration
├── package.json                       # Frontend dependencies
├── start.ps1                          # PowerShell startup script
├── Dockerfile                         # Docker image for frontend
└── README.md                          # Frontend-specific docs
```

### Key Frontend Files Explained

**App.jsx**

- Root component that sets up routing and global providers
- Handles authentication state
- Renders pages based on user login status

**LearningContext.jsx**

- Redux/Context API for global state
- Stores: user data, selected topic, lesson content, progress
- Prevents prop drilling across deep component trees

**aiService.js**

- Calls backend endpoints: `/api/lesson`, `/api/practice`, `/api/quiz`, `/api/chat`
- Validates AI responses before displaying to user
- Handles error states and retry logic
- Extracts question data from various response formats

**PracticeView.jsx / QuizView.jsx / LessonView.jsx**

- Display components for AI-generated content
- Handle user interactions (answer questions, submit, next)
- Extract questions from AI responses in different formats
- Gracefully fall back to curriculum data if AI fails

**LevelLadder.jsx**

- Displays Candy Crush-style level progression
- Shows which levels are unlocked based on progress
- Animated transitions when clicking levels

---

## 🔌 Node.js Backend Structure (`/backend_node`)

**Purpose**: This is the live backend. It owns authentication, progress, curriculum endpoints, caching, and the AI request flow that the frontend actually uses.

**Why it exists**: It keeps the browser talking to one stable API contract instead of branching across multiple AI services in the client.

**How it works**: The frontend posts to `/api/*`, the controller normalizes the payload and checks MongoDB cache, and the service layer calls OpenAI or Gemini directly when fresh content is needed.

### Node Backend Directory Layout

```
backend_node/
├── src/
│   ├── server.js                      # Express app setup and routes
│   ├── config/
│   │   └── db.js                      # MongoDB connection configuration
│   ├── controllers/
│   │   ├── userController.js          # User creation, signup, login logic
│   │   ├── progressController.js      # Get/update user progress in DB
│   │   ├── aiController.js            # Main AI content generation endpoint
│   │   ├── curriculumController.js    # Fetch curriculum data
│   │   └── resourceController.js      # Manage learning resources
│   ├── models/
│   │   ├── User.js                    # MongoDB User schema
│   │   ├── Progress.js                # MongoDB Progress tracking schema
│   │   ├── Lesson.js                  # Cached lesson schema
│   │   ├── Practice.js                # Cached practice questions schema
│   │   ├── Quiz.js                    # Cached quiz schema
│   │   ├── Conversation.js            # Chat history schema
│   │   ├── GeneratedContent.js        # Generic content cache schema
│   │   └── Resource.js                # Learning resources schema
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT authentication check
│   ├── routes/
│   │   └── api.js                     # Express routes (all API endpoints)
│   └── services/
│       ├── aiService.js               # Main AI orchestration logic
│       ├── geminiService.js           # Calls Google Gemini API
│       ├── lessonGeneratorService.js  # Generates lesson content
│       ├── practiceGeneratorService.js # Generates practice questions
│       ├── quizGeneratorService.js    # Generates quiz questions
│       └── contentGeneratorService.js # Generic content generation
├── data/
│   ├── ai_prompt_templates_guidelines.json  # AI prompt templates
│   └── luganda_curriculum_structure.json    # Curriculum structure
├── Dockerfile                         # Docker image for Node backend
├── package.json                       # Node dependencies
├── .env                               # Environment variables (not in Git)
├── .env.example                       # Template for .env
└── README.md                          # Node backend-specific docs
```

### Key Node Backend Files Explained

**server.js**

- Initializes Express app
- Sets up middleware (CORS, JSON parsing, auth)
- Connects to MongoDB
- Registers all API routes

**aiController.js**

- Main endpoint handler for AI generation
- Routes to appropriate service (lesson/practice/quiz/chat)
- Validates request parameters
- Adds caching logic (cache key includes topic objectives)
- Returns response with provider and cache status

**aiService.js**

- Orchestrates which AI provider to use (Gemini, OpenAI, local)
- Calls appropriate service based on content type
- Handles response caching and retrieval
- Validates AI responses match expected format

**practiceGeneratorService.js**

- Constructs AI prompts for practice questions
- Sends request to AI provider
- Includes topic objectives in prompt and cache key
- Formats response with question extraction

**geminiService.js**

- Direct API calls to Google Gemini
- Handles authentication with API key
- Manages rate limiting and retries

**Models (User.js, Progress.js, Lesson.js, etc.)**

- MongoDB schemas defining database structure
- User model: username, email, progress data
- Progress model: completed lessons, current level, streaks
- Lesson/Practice/Quiz models: cached AI-generated content with timestamps

**authMiddleware.js**

- Checks JWT token on protected routes
- Verifies user is authenticated before accessing data

**API Endpoints (defined in routes/api.js)**

```
POST   /api/user              - Create/upsert user
GET    /api/progress/:userId  - Get user progress
POST   /api/progress/:userId  - Update user progress
POST   /api/lesson            - Generate lesson (AI-powered)
POST   /api/practice          - Generate practice questions
POST   /api/quiz              - Generate quiz
POST   /api/chat              - Chat with AI tutor
GET    /api/curriculum        - Get curriculum structure
GET    /api/resources         - Get learning resources
```

## 🗄️ Database Schemas (MongoDB)

### User Schema

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  class: String (S1-S4),
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  currentLevel: Number,
  completedLessons: Array,
  completedQuizzes: Array,
  completedPractices: Array,
  streak: Number,
  lastActivityDate: Date,
  totalPoints: Number,
  unlockedLessons: Array
}
```

### Lesson Schema (Cache)

```javascript
{
  _id: ObjectId,
  topic: String,
  classLevel: String,
  term: Number,
  content: Object,
  provider: String (gemini/openai/local),
  cached: Boolean,
  createdAt: Date,
  ttl: Number (Time to live in seconds)
}
```

### Conversation Schema (Chat History)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  messages: Array,
  topic: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 API Endpoints Summary

### User Management

- `POST /api/user` - Create/login user
- `GET /api/progress/:userId` - Get progress
- `POST /api/progress/:userId` - Update progress

### AI Content Generation

- `POST /api/lesson` - Generate lesson
- `POST /api/practice` - Generate practice questions
- `POST /api/quiz` - Generate quiz
- `POST /api/chat` - Chat with tutor

### Curriculum

- `GET /api/curriculum` - Get curriculum structure
- `GET /api/resources` - Get learning resources

### Python Backend (Reference Only)

- `backend/` is not the active request path for the current frontend flow
- Keep it in mind for training and historical comparison, not for browser requests unless you explicitly rewire it

---

## 🔄 Data Flow

### User Learns a Lesson

1. **Frontend**: User clicks on a lesson in dashboard
2. **Frontend → Node Backend**: POST `/api/lesson` with topic and class level
3. **Node Backend**: Normalizes the request, builds a cache key, and checks MongoDB first
4. **Node AI Service**:

- Builds prompts from the curriculum and lesson metadata
- Calls OpenAI or Gemini directly from the server
- Returns a structured lesson object for the UI

5. **Node Backend**: Saves the response in MongoDB for later reuse
6. **Frontend**: Receives lesson data and renders it with the lesson components
7. **LessonView.jsx**: Turns the API payload into readable sections, examples, and actions

### User Takes a Quiz

1. **Frontend**: POST `/api/quiz` with topic and difficulty
2. **Node Backend**: Checks cache, generates if needed
3. **AI Service**: Creates quiz questions using AI and keeps the format consistent for the UI
4. **Frontend**: Displays quiz with timer and answer checking
5. **User submits**: POST `/api/progress/:userId` to save score
6. **Database**: Updates user progress, achievements, streaks

### Caching Strategy

- Lessons, quizzes, and practice content are cached in MongoDB by `backend_node`
- Cache key includes topic, class level, term, week, objectives, language, and related criteria
- Prevents redundant AI calls for the same learning request
- TTL keeps the cache fresh without regenerating content on every visit
- Frontend can show whether content came from cache or from a fresh provider call

---

## 🐳 Docker & Deployment

### Docker Setup

Each active service has a Dockerfile:

- `frontend/Dockerfile` - Node + npm + React build
- `backend_node/Dockerfile` - Node.js + Express

### docker-compose.yml

Orchestrates all services:

```yaml
services:
  frontend: # Port 3000
  backend_node: # Port 5000
  mongodb: # MongoDB database
```

### Deployment Options

- **Railway**: Use `railway.json` and `Procfile`
- **Vercel**: Frontend only, use `vercel.json`
- **Docker Hub**: Push images from docker-compose
- **Local**: Run `npm run dev` in frontend and `npm run dev` in backend_node

---

## 🔑 Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
```

### Node Backend (.env)

```
MONGO_URI=mongodb://localhost:27017/lulimi-lingo
PORT=5000
JWT_SECRET=your-secret
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
GEMINI_MODEL=gemini-flash-latest
OPENAI_MODEL=gpt-4o
```

## 🛠️ Tech Stack Summary

| Layer                | Technology              | Purpose                       |
| -------------------- | ----------------------- | ----------------------------- |
| **Frontend**         | React 18, Vite          | Modern UI, fast bundling      |
| **Frontend Styling** | CSS3, Framer Motion     | Animations, responsive design |
| **Backend (API)**    | Express.js, Node.js     | REST API, routing, caching    |
| **Backend (AI)**     | OpenAI, Gemini via Node | AI content generation         |
| **Database**         | MongoDB                 | User data, progress, caching  |
| **AI Providers**     | Gemini, OpenAI          | Content generation            |
| **Authentication**   | JWT                     | Secure user sessions          |
| **Containerization** | Docker, docker-compose  | Deployment                    |
| **Hosting**          | Railway, Vercel, Docker | Production deployment         |

---

## 📝 Configuration Files

### vite.config.js

- Vite build configuration
- Sets up React plugin
- Defines port (3000)

### package.json

- NPM/Node dependencies
- Build scripts (`npm run dev`, `npm run build`)
- Dev dependencies (Vite, React)

### requirements.txt

- Not used in the current Node-only architecture

### Procfile

- Defines how to run the active app on Railway
- Starts the Node backend flow used by the frontend

---

## 🚀 Quick Start

### 1. Clone/Navigate

```bash
cd "c:\Users\DELL\Desktop\LLAi project"
```

### 2. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Install & Start Node Backend

```bash
cd backend_node
npm install
npm run dev
```

### 4. Open in Browser

- Frontend: `http://localhost:3000`
- Node API: `http://localhost:5000`

---

## 📚 Key Concepts

### Curriculum Structure

- Classes: S1, S2, S3, S4 (Uganda school system)
- Terms: Term 1, Term 2, Term 3
- Weeks: Week 1-12 per term
- Topics: Greetings, Numbers, Family, etc.
- Each topic has learning objectives and outcomes

### Gamification

- Levels unlock progressively
- Streaks reward daily practice
- Achievements for milestones
- Points for completing activities
- Progress bar visualization

### Caching Strategy

- AI-generated content cached in MongoDB
- Cache key includes topic + class + objectives
- Prevents redundant API calls
- TTL ensures fresh content periodically
- Badge shows if content is from library vs freshly generated

---

## 🔗 Related Documentation

- [CONTAINERIZATION_COMPLETE.md](CONTAINERIZATION_COMPLETE.md) - Docker setup details
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Railway hosting guide
- [RESPONSIVE_FIXES.md](RESPONSIVE_FIXES.md) - UI responsive design fixes
- [backend_node/README.md](backend_node/README.md) - Node backend details
- [frontend/README.md](frontend/README.md) - Frontend details

---

**Last Updated**: June 2026  
**Project Status**: Full-stack AI-powered learning platform for Ugandan local languages  
**Version**: 1.0.0
