"""
Lulimi Lingo - FastAPI Backend
===============================
Main entry point for the Python AI backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from loguru import logger
import os

from ai.gemini_client import GeminiClient
from ai.openai_translator import OpenAITranslator

from config import settings
from ai.tutor import LugandaTutor
from ai.lesson_generator import LessonGenerator
from ai.quiz_generator import QuizGenerator
from ai.practice_generator import PracticeGenerator
from api_monitor import monitor

# Initialize FastAPI app
app = FastAPI(
    title="Lulimi Lingo API",
    description="AI-powered Luganda language learning backend",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI components (lazy loading)
tutor: Optional[LugandaTutor] = None
lesson_gen: Optional[LessonGenerator] = None
quiz_gen: Optional[QuizGenerator] = None
practice_gen: Optional[PracticeGenerator] = None
gemini_client: Optional[GeminiClient] = None
openai_translator: Optional[OpenAITranslator] = None

# Simple in-memory usage tracking
usage_stats = {
    "gemini_calls": 0,
    "openai_calls": 0,
    "estimated_cost": 0.0
}


# ============ REQUEST/RESPONSE MODELS ============

class ChatRequest(BaseModel):
    message: str
    completed_topics: List[str] = []
    conversation_history: List[Dict[str, str]] = []


class ChatResponse(BaseModel):
    response: str
    encouragement: Optional[str] = None
    suggested_topics: List[str] = []


class LessonRequest(BaseModel):
    class_level: str
    term: str
    week: str
    topic: str
    objectives: List[str] = []


class LessonResponse(BaseModel):
    success: bool
    lesson: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class PracticeRequest(BaseModel):
    topic: str
    proficiency_level: str = "beginner"
    common_mistakes: List[str] = []


class PracticeResponse(BaseModel):
    success: bool
    questions: List[Dict[str, Any]] = []
    error: Optional[str] = None


class QuizRequest(BaseModel):
    topic: str
    number_of_questions: int = 5
    assessment_criteria: List[str] = []


class QuizResponse(BaseModel):
    success: bool
    quiz: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class FeedbackRequest(BaseModel):
    learner_answers: Dict[str, str]
    correct_answers: Dict[str, str]
    topic_objectives: List[str] = []


class FeedbackResponse(BaseModel):
    success: bool
    feedback: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    error: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str = "lg"


class TranslateResponse(BaseModel):
    success: bool
    translation: str
    model: Optional[str] = None


# ============ STARTUP/SHUTDOWN ============

@app.on_event("startup")
async def startup_event():
    """Initialize AI models on startup."""
    global tutor, lesson_gen, quiz_gen, practice_gen
    
    logger.info("Starting Lulimi Lingo Backend...")
    logger.info(f"AI Provider: {settings.ai_provider} (using OpenAI as primary)")
    
    try:
        # Initialize the tutor (main AI component)
        tutor = LugandaTutor(
            provider=settings.ai_provider,
            model_path=settings.local_model_path,
            gemini_key=settings.gemini_api_key,
            openai_key=settings.openai_api_key
        )
        
        # Initialize generators
        lesson_gen = LessonGenerator(tutor)
        quiz_gen = QuizGenerator(tutor)
        practice_gen = PracticeGenerator(tutor)

        # Initialize API clients (if keys present)
        global gemini_client, openai_translator
        gemini_client = GeminiClient(api_key=settings.gemini_api_key)
        openai_translator = OpenAITranslator(
            api_key=settings.openai_api_key,
            model=settings.openai_model
        )
        
        # Log API availability
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set — Gemini generation will use OpenAI fallback or mocks")
        else:
            logger.info("✓ Gemini API configured")
            
        if settings.openai_api_key and settings.openai_api_key != "your-openai-api-key-here":
            logger.info("✓ OpenAI API configured for translation")
        else:
            logger.warning("OPENAI_API_KEY not set — Translation API will be unavailable")
        
        logger.info("AI components initialized successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize AI: {e}")
        logger.warning("Running in mock mode - AI responses will be simulated")


def record_api_call(provider: str, cost_per_call: float = 0.0, tokens: int = 0, success: bool = True):
    """Record an API call with monitoring."""
    # Legacy stats
    if provider == "gemini":
        usage_stats["gemini_calls"] += 1
    if provider == "openai":
        usage_stats["openai_calls"] += 1
    usage_stats["estimated_cost"] += float(cost_per_call)
    
    # New monitoring system
    monitor.record_request(provider, tokens=tokens, success=success, custom_cost=cost_per_call)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Lulimi Lingo Backend...")


# ============ HEALTH CHECK ============

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "ai_provider": settings.ai_provider,
        "tutor_loaded": tutor is not None
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Lulimi Lingo AI Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }


# ============ CHAT/TUTOR ENDPOINTS ============

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_tutor(request: ChatRequest):
    """Chat with the AI Luganda tutor."""
    try:
        if tutor is None:
            # Return mock response if tutor not loaded
            return ChatResponse(
                response=get_mock_tutor_response(request.message),
                encouragement="Keep practicing! You're doing great! 💪"
            )
        
        response = await tutor.chat(
            message=request.message,
            completed_topics=request.completed_topics,
            history=request.conversation_history
        )
        
        return ChatResponse(**response)
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ LESSON ENDPOINTS ============

@app.post("/api/lesson", response_model=LessonResponse)
async def generate_lesson(request: LessonRequest):
    """Generate an AI lesson for a topic."""
    try:
        if lesson_gen is None:
            return LessonResponse(
                success=True,
                lesson=get_mock_lesson(request.topic)
            )
        
        lesson = await lesson_gen.generate(
            class_level=request.class_level,
            term=request.term,
            week=request.week,
            topic=request.topic,
            objectives=request.objectives
        )
        
        return LessonResponse(success=True, lesson=lesson)
    
    except Exception as e:
        logger.error(f"Lesson generation error: {e}")
        return LessonResponse(success=False, error=str(e))


@app.post("/api/gemini/generate", response_model=LessonResponse)
async def gemini_generate(request: LessonRequest):
    """Generate a structured lesson using Gemini."""
    try:
        if gemini_client is None:
            return LessonResponse(success=False, error="Gemini client not configured")

        syllabus_meta = {
            "title": request.topic,
            "objectives": request.objectives,
            "level": request.class_level,
            "term": request.term,
            "week": request.week,
        }
        resp = gemini_client.generate_structured(syllabus_meta)
        # Record a simple per-call cost (env override)
        gemini_cost = float(os.environ.get("GEMINI_COST_PER_CALL", "0.0"))
        tokens = gemini_client.last_token_count if hasattr(gemini_client, 'last_token_count') else 0
        record_api_call("gemini", cost_per_call=gemini_cost, tokens=tokens, success=True)
        return LessonResponse(success=True, lesson=resp)
    except Exception as e:
        logger.error(f"Gemini generate error: {e}")
        return LessonResponse(success=False, error=str(e))


# ============ PRACTICE ENDPOINTS ============

@app.post("/api/practice", response_model=PracticeResponse)
async def generate_practice(request: PracticeRequest):
    """Generate practice questions."""
    try:
        if practice_gen is None:
            return PracticeResponse(
                success=True,
                questions=get_mock_practice_questions()
            )
        
        questions = await practice_gen.generate(
            topic=request.topic,
            proficiency_level=request.proficiency_level,
            common_mistakes=request.common_mistakes
        )
        
        return PracticeResponse(success=True, questions=questions)
    
    except Exception as e:
        logger.error(f"Practice generation error: {e}")
        return PracticeResponse(success=False, error=str(e))


# ============ QUIZ ENDPOINTS ============

@app.post("/api/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """Generate a quiz."""
    try:
        if quiz_gen is None:
            return QuizResponse(
                success=True,
                quiz={"questions": get_mock_quiz_questions(request.number_of_questions)}
            )
        
        quiz = await quiz_gen.generate(
            topic=request.topic,
            num_questions=request.number_of_questions,
            criteria=request.assessment_criteria
        )
        
        return QuizResponse(success=True, quiz=quiz)
    
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        return QuizResponse(success=False, error=str(e))


# ============ FEEDBACK ENDPOINTS ============

@app.post("/api/feedback", response_model=FeedbackResponse)
async def generate_feedback(request: FeedbackRequest):
    """Generate feedback for learner answers."""
    try:
        # Calculate score
        correct = sum(
            1 for q, a in request.learner_answers.items()
            if request.correct_answers.get(q, "").lower() == a.lower()
        )
        total = len(request.correct_answers)
        score = (correct / total * 100) if total > 0 else 0
        
        if tutor is None:
            return FeedbackResponse(
                success=True,
                feedback=get_mock_feedback(score),
                score=score
            )
        
        feedback = await tutor.generate_feedback(
            answers=request.learner_answers,
            correct=request.correct_answers,
            objectives=request.topic_objectives
        )
        
        return FeedbackResponse(success=True, feedback=feedback, score=score)
    
    except Exception as e:
        logger.error(f"Feedback generation error: {e}")
        return FeedbackResponse(success=False, error=str(e))


# ============ TRANSLATION ENDPOINTS ============


@app.post("/api/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """Translate text using OpenAI."""
    try:
        if not openai_translator:
            return TranslateResponse(success=False, translation="", model="OpenAI translator not initialized")

        normalized_text = (request.text or "").strip()
        if not normalized_text:
            return TranslateResponse(success=True, translation="", model="noop-empty-input")

        if (request.source_lang or "").strip().lower() == (request.target_lang or "").strip().lower():
            return TranslateResponse(success=True, translation=normalized_text, model="noop-same-language")

        translated = openai_translator.translate(normalized_text, request.source_lang, request.target_lang)
        openai_cost = float(os.environ.get("OPENAI_COST_PER_CALL", "0"))
        tokens = len(normalized_text.split()) + len(translated.split())
        record_api_call("openai", cost_per_call=openai_cost, tokens=tokens, success=True)
        return TranslateResponse(success=True, translation=translated, model=openai_translator.model)
    
    except Exception as e:
        logger.error(f"Translation error: {e}")
        record_api_call("openai", cost_per_call=0, tokens=0, success=False)
        return TranslateResponse(
            success=False,
            translation="",
            model=str(e)
        )


@app.get("/api/usage")
async def get_usage():
    """Get comprehensive API usage statistics and monitoring."""
    return {
        "legacy_stats": usage_stats,
        "detailed_monitoring": monitor.get_status()
    }


@app.get("/api/usage/report")
async def get_usage_report():
    """Get detailed usage report with recommendations."""
    return monitor.export_report()


@app.post("/api/usage/reset")
async def reset_usage(provider: Optional[str] = None):
    """Reset usage statistics."""
    monitor.reset_stats(provider)
    return {"success": True, "message": f"Reset stats for {provider or 'all providers'}"}


# ============ MOCK RESPONSES ============

def get_mock_tutor_response(message: str) -> str:
    """Generate mock tutor response."""
    message_lower = message.lower()
    
    if "hello" in message_lower or "hi" in message_lower:
        return "Oli otya! 👋 Hello! In Luganda, we greet by asking 'How are you?' - 'Oli otya?' The response is 'Gyendi' (I'm fine). What would you like to learn today?"
    
    if "thank" in message_lower:
        return "Webale! That means 'Thank you' in Luganda. You can also say 'Webale nnyo' for 'Thank you very much'. You're making great progress!"
    
    if "morning" in message_lower:
        return "'Good morning' in Luganda is 'Wasuze otya?' - literally 'How did you wake up/sleep?' The response is 'Gyendi' or 'Bulungi' (Fine/Well)."
    
    if "greet" in message_lower:
        return "In Luganda, greetings depend on time of day: Morning: 'Wasuze otya?' (How did you sleep?), Afternoon/Evening: 'Osiibye otya?' (How has your day been?), General: 'Oli otya?' (How are you?). The response is usually 'Gyendi' (I'm fine) or 'Bulungi' (Good)."
    
    return "That's a great question! Based on what you've learned, let me explain... In Luganda, we always start with greetings. Would you like me to explain more about this topic?"


def get_mock_lesson(topic: str) -> Dict[str, Any]:
    """Generate mock lesson content."""
    return {
        "introduction": f"Welcome to today's lesson on {topic}! In Luganda culture, this topic is very important for daily communication.",
        "explanation": "Luganda greetings change based on the time of day and the age of the person you're greeting. It's important to use the correct form to show proper respect.",
        "examples": [
            {"luganda": "Oli otya?", "english": "How are you?", "usage": "Informal, to peers"},
            {"luganda": "Wasuze otya?", "english": "Good morning", "usage": "Morning greeting"},
            {"luganda": "Osiibye otya?", "english": "Good afternoon/evening", "usage": "Afternoon/evening"},
            {"luganda": "Gyendi", "english": "I'm fine", "usage": "Response to greetings"},
            {"luganda": "Webale", "english": "Thank you", "usage": "Expressing gratitude"}
        ],
        "culturalNote": "In Luganda culture, it's considered rude to jump straight into conversation without proper greetings. Always take time to greet and ask about someone's wellbeing first. Younger people are expected to initiate greetings with elders.",
        "keyPoints": [
            "Always greet before starting a conversation",
            "Use appropriate greetings based on time of day",
            "Show respect to elders in your greetings"
        ]
    }


def get_mock_practice_questions() -> List[Dict[str, Any]]:
    """Generate mock practice questions."""
    return [
        {
            "id": 1,
            "type": "fill-blank",
            "question": "Complete: '_____ otya?' (How are you?)",
            "options": ["Oli", "Gwe", "Nze", "Ye"],
            "correctAnswer": "Oli",
            "hint": "This is the informal 'you' in Luganda"
        },
        {
            "id": 2,
            "type": "multiple-choice",
            "question": "What does 'Wasuze otya?' mean?",
            "options": ["Good night", "Good morning", "Goodbye", "Thank you"],
            "correctAnswer": "Good morning",
            "hint": "This greeting asks about how someone slept"
        },
        {
            "id": 3,
            "type": "translate",
            "question": "Translate to Luganda: 'Thank you'",
            "correctAnswer": "Webale",
            "hint": "Starts with 'We...'"
        },
        {
            "id": 4,
            "type": "multiple-choice",
            "question": "How do you respond to 'Oli otya?'",
            "options": ["Webale", "Gyendi", "Wasuze otya", "Simanyi"],
            "correctAnswer": "Gyendi",
            "hint": "This means 'I'm fine'"
        },
        {
            "id": 5,
            "type": "fill-blank",
            "question": "Complete: 'Osiibye _____?' (Good afternoon)",
            "options": ["otya", "bulungi", "nnyo", "ko"],
            "correctAnswer": "otya",
            "hint": "This word means 'how'"
        }
    ]


def get_mock_quiz_questions(num: int = 5) -> List[Dict[str, Any]]:
    """Generate mock quiz questions."""
    all_questions = [
        {
            "id": 1,
            "question": "What is the appropriate greeting for the morning in Luganda?",
            "options": ["Osiibye otya?", "Wasuze otya?", "Oli otya?", "Weraba"],
            "correctAnswer": "Wasuze otya?",
            "points": 2
        },
        {
            "id": 2,
            "question": "Translate 'Thank you' into Luganda:",
            "options": ["Gyendi", "Webale", "Nsanyuse", "Saawa"],
            "correctAnswer": "Webale",
            "points": 2
        },
        {
            "id": 3,
            "question": "When would you use 'Osiibye otya?'",
            "options": ["In the morning", "In the afternoon/evening", "At midnight", "When leaving"],
            "correctAnswer": "In the afternoon/evening",
            "points": 2
        },
        {
            "id": 4,
            "question": "What does 'Gyendi' mean?",
            "options": ["Hello", "Goodbye", "I'm fine", "Thank you"],
            "correctAnswer": "I'm fine",
            "points": 2
        },
        {
            "id": 5,
            "question": "Complete: 'Gyebale ___' (Well done/Thank you for your work)",
            "options": ["nnyo", "ko", "otya", "bulungi"],
            "correctAnswer": "ko",
            "points": 2
        }
    ]
    return all_questions[:num]


def get_mock_feedback(score: float) -> Dict[str, Any]:
    """Generate mock feedback."""
    if score >= 80:
        level = "Excellent"
        message = "Outstanding work! You have a strong grasp of Luganda greetings."
    elif score >= 60:
        level = "Good"
        message = "Good effort! You're making solid progress with Luganda."
    else:
        level = "Keep Practicing"
        message = "Don't give up! Practice makes perfect. Review the lesson and try again."
    
    return {
        "level": level,
        "message": message,
        "strengths": ["Good understanding of basic greetings", "Correct use of 'Webale'"],
        "improvements": ["Practice time-based greetings", "Review responses to greetings"],
        "nextSteps": ["Review the lesson on greetings", "Practice with the chatbot"]
    }


# ============ RUN SERVER ============

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
