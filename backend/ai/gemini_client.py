"""Gemini API client for content generation.

Uses google.genai or falls back to OpenAI.
"""
from typing import Any, Dict, Optional
import os
from loguru import logger

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.model_name = model or os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        self.enabled = bool(self.api_key and self.api_key != "your-gemini-api-key-here")
        self.client = None
        
        # OpenAI fallback
        self.openai_key = os.environ.get("OPENAI_API_KEY")
        self.openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        self.openai_client = None
        # Token tracking
        self.last_token_count = 0
        # Initialize the appropriate client
        self._init_client()
    
    def _init_client(self):
        """Initialize Gemini or fallback to OpenAI."""
        if self.enabled:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"Gemini client initialized with google.genai: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize google.genai: {e}")
                self.client = None
                self.enabled = False
        
        # Setup OpenAI fallback
        if not self.enabled and self.openai_key and self.openai_key != "your-openai-api-key-here":
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=self.openai_key)
                logger.info("OpenAI fallback initialized for Gemini")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI fallback: {e}")

    def generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.2) -> Dict[str, Any]:
        """Generate content from a prompt. Returns parsed JSON when possible."""
        
        logger.info(
            "generate() called - enabled: {enabled}, genai: {genai}, openai: {openai}",
            enabled=self.enabled,
            genai=self.client is not None,
            openai=self.openai_client is not None,
        )
        
        # Try Gemini first
        if self.enabled and self.client:
            try:
                logger.info(f"Generating content with google.genai model: {self.model_name}")
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens,
                    },
                )
                content_text = self._extract_genai_text(response)
                if not content_text:
                    raise ValueError("Empty response from google.genai")

                self.last_token_count = len(prompt.split()) + len(content_text.split())
                return {"raw": content_text}
            except Exception as e:
                logger.error(f"google.genai generation error: {str(e)[:200]}")

        logger.warning("Gemini not available - using OpenAI fallback")
        try:
            logger.info("Trying OpenAI fallback for content generation")
            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates structured educational content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            content = response.choices[0].message.content
            logger.info("OpenAI fallback successful")

            # Track tokens from OpenAI response
            self.last_token_count = response.usage.total_tokens if hasattr(response, 'usage') else 0

            return {"raw": content}
        except Exception as e:
            logger.error(f"OpenAI fallback error: {e}", exc_info=True)
        
        # Final fallback: return mock data
        logger.warning("No AI provider available - returning mock data")
        return {
            "title": "(mock) Generated content unavailable",
            "objectives": ["API key required for real generation"],
            "content": "Please configure GEMINI_API_KEY or OPENAI_API_KEY in .env to enable real AI generation.",
            "exercises": [],
            "answers": {}
        }

    def _extract_genai_text(self, response: Any) -> str:
        if not response:
            return ""
        direct_text = getattr(response, "text", None)
        if direct_text:
            return direct_text

        candidates = getattr(response, "candidates", None)
        if not candidates:
            return ""

        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) if content else None
            if not parts:
                continue
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    return part_text

        return ""

    def generate_structured(self, syllabus_meta: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structured lesson content from syllabus metadata.
        
        Args:
            syllabus_meta: Dictionary with title, objectives, level, term, week, topics, language
            
        Returns:
            Structured lesson with introduction, explanation, examples, exercises, etc.
        """
        language = syllabus_meta.get('language', 'luganda').lower()
        language_name = 'Runyankole' if language == 'runyankole' else 'Luganda'
        
        prompt = f"""Generate a comprehensive {language_name} language lesson with the following details:

Title: {syllabus_meta.get('title', 'Untitled')}
Class Level: {syllabus_meta.get('level', 'Beginner')}
Term: {syllabus_meta.get('term', '')}
Week: {syllabus_meta.get('week', '')}
Learning Objectives: {', '.join(syllabus_meta.get('objectives', []))}
Topics to cover: {', '.join(syllabus_meta.get('topics', []))}

Please provide a structured lesson with the following sections:

1. **Introduction** (2-3 sentences introducing the topic in an engaging way)
2. **Main Content** (detailed explanation of the concepts, vocabulary, and grammar)
3. **Examples** (5-7 practical examples with {language_name} text, English translation, and usage context)
4. **Cultural Context** (relevant cultural notes about {language_name} language and Ugandan culture)
5. **Practice Exercises** (3-5 exercises for students to practice)
6. **Key Takeaways** (3-5 main points students should remember)

Format: Provide clear, beginner-friendly explanations. Use proper {language_name} spelling and grammar.
Make the content engaging and culturally appropriate."""

        result = self.generate(prompt, max_tokens=2048, temperature=0.3)
        
        
        # Try to parse the response into structured format
        if "raw" in result:
            # For now, return the raw text
            # TODO: Add JSON parsing or structured extraction
            return {
                "title": syllabus_meta.get('title', 'Luganda Lesson'),
                "level": syllabus_meta.get('level', ''),
                "term": syllabus_meta.get('term', ''),
                "week": syllabus_meta.get('week', ''),
                "objectives": syllabus_meta.get('objectives', []),
                "content": result["raw"],
                "exercises": [],
                "cultural_notes": ""
            }
        
        return result
