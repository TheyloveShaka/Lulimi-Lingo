"""
AI Module for Lulimi Lingo
"""

from .tutor import LugandaTutor
from .lesson_generator import LessonGenerator
from .quiz_generator import QuizGenerator
from .practice_generator import PracticeGenerator
from .gemini_client import GeminiClient
from .openai_translator import OpenAITranslator
from .chatbot_client import ChatbotClient

__all__ = [
    "LugandaTutor",
    "LessonGenerator", 
    "QuizGenerator",
    "PracticeGenerator"
    ,"GeminiClient",
    "OpenAITranslator",
    "ChatbotClient"
]
