# Lulimi Lingo - Python AI Backend

## Overview

This is the Python backend for Lulimi Lingo's AI-powered Luganda language learning system. It handles:

-  **AI Tutoring** - Chat with an AI Luganda teacher
-  **Lesson Generation** - Generate structured lessons
- ️ **Practice Exercises** - Create interactive practice questions
-  **Quiz Generation** - Generate adaptive quizzes
-  **Feedback** - Evaluate and provide feedback on learner answers

## Architecture

```
backend/
├── main.py                 # FastAPI server
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── ai/
│   ├── tutor.py           # Main AI tutor class
│   ├── lesson_generator.py
│   ├── quiz_generator.py
│   └── practice_generator.py
├── models/                # Fine-tuned models (created during training)
├── data/
│   ├── training/         # Training data for fine-tuning
│   └── lulimi_lingo.db   # SQLite database
└── logs/                 # Application logs
```

## AI Provider Options

### 1. **Local Model** (Recommended - FREE)

- Uses fine-tuned Gemma-2B or Mistral-7B
- Runs on your machine (GPU recommended but CPU works)
- No API costs
- Full privacy and control

### 2. **Google Gemini** (Free Tier Available)

- **Cost**: FREE up to 60 requests/minute
- **How to get**: https://makersuite.google.com/app/apikey
- Best for: Development and testing

### 3. **OpenAI** (Paid)

- **Cost**: ~$0.002 per request
- Best for: Production with high quality requirements

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# For local model (free)
AI_PROVIDER=local
LOCAL_MODEL_NAME=google/gemma-2b-it
USE_QUANTIZATION=true

# OR for Gemini (free tier)
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here

# OR for OpenAI (paid)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
```

### 3. Run the Server

```bash
python main.py
```

Server will start at: **http://localhost:8000**

API docs: **http://localhost:8000/docs**

## API Endpoints

### Chat with Tutor

```http
POST /api/chat
{
  "message": "How do I say hello in Luganda?",
  "completed_topics": ["Basic Greetings"],
  "conversation_history": []
}
```

### Generate Lesson

```http
POST /api/lesson
{
  "class_level": "S1",
  "term": "Term 1",
  "week": "Week 1",
  "topic": "Greetings",
  "objectives": ["Learn basic greetings"]
}
```

### Generate Practice

```http
POST /api/practice
{
  "topic": "Greetings",
  "proficiency_level": "beginner"
}
```

### Generate Quiz

```http
POST /api/quiz
{
  "topic": "Greetings",
  "number_of_questions": 5
}
```

## Fine-Tuning Your Own Luganda Model

The backend supports fine-tuning a local model on Luganda data. This gives you the best results for FREE.

### Why Fine-Tune?

-  **Luganda-specific** - Model learns Luganda patterns
-  **FREE** - No API costs
-  **Fast** - Local inference
-  **Private** - Your data stays on your machine
-  **Customizable** - Teach it your specific syllabus

### Training Script (Coming Next)

I'll create a training script that:

1. Loads your Luganda syllabus
2. Generates training data
3. Fine-tunes Gemma-2B using LoRA (efficient)
4. Saves the model for use

Would you like me to create the fine-tuning script now?

## Hardware Requirements

### Minimum (CPU only)

- 8GB RAM
- Works but slow

### Recommended (GPU)

- NVIDIA GPU with 6GB+ VRAM
- 16GB RAM
- Fast inference

### Cloud Option

- Google Colab (FREE GPU)
- Kaggle (FREE GPU)

## Connecting to Frontend

Update `frontend/src/services/aiService.js`:

```javascript
const AI_CONFIG = {
  // Use Python backend instead of direct API calls
  primaryEndpoint: "http://localhost:8000/api",
  useMockResponses: false,
};
```

## Next Steps

1.  Backend structure created
2. ⏳ **Create fine-tuning script** - Train your own Luganda model
3. ⏳ **Prepare training data** - Convert syllabus to training format
4. ⏳ **Connect frontend** - Update aiService.js to use Python backend

Ready to create the fine-tuning script?
