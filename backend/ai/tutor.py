"""
Lulimi Lingo - Luganda AI Tutor
================================
Main AI tutor class that handles all AI interactions.
Supports local models (Gemma), Gemini API, and OpenAI.
"""

import os
from typing import List, Dict, Any, Optional, Literal
from loguru import logger
import json


class LugandaTutor:
    """
    AI Tutor for Luganda language learning.
    
    Supports multiple backends:
    - local: Uses a fine-tuned local model (Gemma, Mistral, etc.)
    - gemini: Uses Google's Gemini API (free tier available)
    - openai: Uses OpenAI's API (paid)
    """
    
    def __init__(
        self,
        provider: Literal["local", "gemini", "openai"] = "local",
        model_path: str = "./models/luganda-tutor",
        gemini_key: Optional[str] = None,
        openai_key: Optional[str] = None
    ):
        self.provider = provider
        self.model_path = model_path
        self.model = None
        self.tokenizer = None
        self.gemini_client = None
        self.gemini_model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        
        # System prompt for the tutor
        self.system_prompt = """You are a professional language teacher and curriculum-aligned tutor.

You teach the target language the way a good classroom teacher would:
- Clear explanations
- Simple examples
- Cultural awareness
- Respectful tone
- Step-by-step progression

STRICT RULES:
1. You must ONLY teach content from the provided syllabus input.
2. You must NOT introduce future topics or advanced concepts.
3. You must adapt explanations to beginner-friendly language.
4. You must explain WHY an answer is correct or incorrect.
5. You must respect cultural norms (age, politeness, greetings).
6. You must never shame or discourage the learner.

PEDAGOGY:
- One concept at a time
- Short explanations
- Pattern-based teaching
- Examples before rules where possible

LANGUAGE HANDLING:
- English is used for explanations.
- The target language is used for examples and practice.
- When in doubt, prefer correctness and simplicity over complexity."""
        
        # Initialize the appropriate backend
        self._init_backend(provider, gemini_key, openai_key)
    
    def _init_backend(self, provider: str, gemini_key: Optional[str], openai_key: Optional[str]):
        """Initialize the AI backend."""
        
        if provider == "local":
            self._init_local_model()
        elif provider == "gemini":
            self._init_gemini(gemini_key)
        elif provider == "openai":
            self._init_openai(openai_key)
        else:
            logger.warning(f"Unknown provider: {provider}. Falling back to mock mode.")
    
    def _init_local_model(self):
        """Initialize local model (Gemma/Mistral)."""
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
            import torch
            
            # Check if fine-tuned model exists
            if os.path.exists(self.model_path):
                model_name = self.model_path
                logger.info(f"Loading fine-tuned model from {self.model_path}")
            else:
                model_name = "google/gemma-2b-it"
                logger.info(f"Fine-tuned model not found. Using base model: {model_name}")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Load model with quantization for efficiency
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto",
                load_in_4bit=True  # Use 4-bit quantization
            )
            
            logger.info("Local model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Failed to load local model: {e}")
            logger.warning("Running in mock mode")
            self.model = None
    
    def _init_gemini(self, api_key: str):
        """Initialize Google Gemini."""
        try:
            if not api_key:
                logger.warning("No Gemini API key provided")
                return

            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=api_key)
                logger.info("Gemini initialized with google.genai")
                return
            except Exception as e:
                logger.warning(f"google.genai init failed: {e}")

        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self.model = None
    
    def _init_openai(self, api_key: str):
        """Initialize OpenAI."""
        try:
            from openai import OpenAI
            
            if not api_key:
                logger.warning("No OpenAI API key provided")
                return
            
            self.model = OpenAI(api_key=api_key)
            logger.info("OpenAI initialized successfully!")
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI: {e}")
            self.model = None
    
    async def chat(
        self,
        message: str,
        completed_topics: List[str] = [],
        history: List[Dict[str, str]] = []
    ) -> Dict[str, Any]:
        """
        Chat with the tutor.
        
        Args:
            message: User's message
            completed_topics: Topics the user has completed
            history: Conversation history
            
        Returns:
            Dict with response, encouragement, and suggested_topics
        """
        
        # Build context from completed topics
        context = f"""
The learner has completed these topics: {', '.join(completed_topics) if completed_topics else 'None yet (beginner)'}.

Only reference concepts from completed topics. Do not teach new material unless asked.
"""
        
        # Generate response based on provider
        if self.provider == "local" and self.model:
            response = await self._local_chat(message, context, history)
        elif self.provider == "gemini" and self.gemini_client:
            response = await self._gemini_chat(message, context, history)
        elif self.provider == "openai" and self.model:
            response = await self._openai_chat(message, context, history)
        else:
            response = self._mock_chat(message)
        
        return {
            "response": response,
            "encouragement": self._get_encouragement(),
            "suggested_topics": self._get_suggested_topics(completed_topics)
        }
    
    async def _local_chat(self, message: str, context: str, history: List) -> str:
        """Generate response using local model."""
        try:
            import torch
            
            # Build prompt
            prompt = f"""<start_of_turn>system
{self.system_prompt}

{context}
<end_of_turn>
"""
            # Add history
            for msg in history[-5:]:  # Last 5 messages
                role = "user" if msg["role"] == "user" else "model"
                prompt += f"<start_of_turn>{role}\n{msg['content']}<end_of_turn>\n"
            
            prompt += f"<start_of_turn>user\n{message}<end_of_turn>\n<start_of_turn>model\n"
            
            # Tokenize and generate
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract just the model's response
            response = response.split("<start_of_turn>model\n")[-1]
            response = response.split("<end_of_turn>")[0].strip()
            
            return response
            
        except Exception as e:
            logger.error(f"Local model error: {e}")
            return self._mock_chat(message)
    
    async def _gemini_chat(self, message: str, context: str, history: List) -> str:
        """Generate response using Gemini."""
        try:
            full_prompt = f"""{self.system_prompt}

{context}

Student question: {message}"""

            response = self.gemini_client.models.generate_content(
                model=self.gemini_model_name,
                contents=full_prompt,
                config={
                    "temperature": 0.7,
                    "max_output_tokens": 512,
                },
            )
            return self._extract_genai_text(response) or self._mock_chat(message)
            
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return self._mock_chat(message)

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
    
    async def _openai_chat(self, message: str, context: str, history: List) -> str:
        """Generate response using OpenAI - flexible for both Luganda learning and general questions."""
        try:
            # Detect if question is about Luganda/learning or general
            luganda_keywords = ['luganda', 'hello', 'greet', 'translate', 'learn', 'pronunciation', 'vocabulary', 'grammar', 'lesson']
            is_luganda_question = any(kw in message.lower() for kw in luganda_keywords)
            
            # Use appropriate system prompt
            if is_luganda_question:
                system_message = f"""You are a professional Luganda language teacher and curriculum-aligned tutor.

You teach Luganda the way a good classroom teacher would:
- Clear explanations
- Simple examples
- Cultural awareness
- Respectful tone
- Step-by-step progression

STRICT RULES:
1. You must ONLY teach content from the provided syllabus input.
2. You must NOT introduce future topics or advanced concepts.
3. You must adapt explanations to beginner-friendly language.
4. You must explain WHY an answer is correct or incorrect.
5. You must respect Luganda cultural norms (age, politeness, greetings).
6. You must never shame or discourage the learner.

{context}"""
            else:
                system_message = f"""You are a helpful, friendly AI assistant. You can answer questions about any topic, help with learning, and engage in meaningful conversations. You're knowledgeable, clear, and always try to be helpful. When relevant to the user's learning of Luganda, include helpful language tips.

{context}"""
            
            messages = [
                {"role": "system", "content": system_message}
            ]
            
            # Add history
            for msg in history[-5:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            messages.append({"role": "user", "content": message})
            
            response = self.model.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return self._mock_chat(message)
    
    def _mock_chat(self, message: str) -> str:
        """Generate mock response for development."""
        message_lower = message.lower()
        
        if "hello" in message_lower or "hi" in message_lower:
            return "Oli otya! 👋 Hello! In Luganda, we greet by asking 'How are you?' - 'Oli otya?' The response is 'Gyendi' (I'm fine). What would you like to learn today?"
        
        if "thank" in message_lower:
            return "Webale! That means 'Thank you' in Luganda. You can also say 'Webale nnyo' for 'Thank you very much'. You're making great progress!"
        
        if "morning" in message_lower:
            return "'Good morning' in Luganda is 'Wasuze otya?' - literally 'How did you wake up/sleep?' The response is 'Gyendi' or 'Bulungi' (Fine/Well)."
        
        return "That's a great question! Based on what you've learned so far, let me explain... In Luganda, we always start with greetings. Would you like me to explain more?"
    
    def _get_encouragement(self) -> str:
        """Get random encouragement message."""
        import random
        messages = [
            "Keep practicing! You're doing great! 💪",
            "Webale nnyo! (Thank you very much!) 🌟",
            "You're making excellent progress! 📚",
            "Keep it up! Luganda will feel natural soon! 🎉"
        ]
        return random.choice(messages)
    
    def _get_suggested_topics(self, completed: List[str]) -> List[str]:
        """Get suggested next topics."""
        all_topics = [
            "Basic Greetings",
            "Family Members",
            "Numbers 1-20",
            "Days of the Week",
            "Common Phrases"
        ]
        return [t for t in all_topics if t not in completed][:3]
    
    async def generate_feedback(
        self,
        answers: Dict[str, str],
        correct: Dict[str, str],
        objectives: List[str]
    ) -> Dict[str, Any]:
        """Generate feedback for learner answers."""
        # Calculate basic feedback
        mistakes = []
        for q, a in answers.items():
            if correct.get(q, "").lower() != a.lower():
                mistakes.append({
                    "question": q,
                    "given": a,
                    "correct": correct.get(q, "")
                })
        
        return {
            "mistakes": mistakes,
            "strengths": ["Good attempt!", "Keep practicing!"],
            "improvements": [f"Review: {m['question']}" for m in mistakes[:3]],
            "nextSteps": ["Practice more", "Review the lesson"]
        }
