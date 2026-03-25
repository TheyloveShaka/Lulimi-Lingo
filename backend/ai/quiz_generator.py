"""
Lulimi Lingo - Quiz Generator
==============================
Generates quizzes using AI.
"""

from typing import List, Dict, Any
from loguru import logger


class QuizGenerator:
    """Generates quizzes for Luganda learning."""
    
    def __init__(self, tutor):
        self.tutor = tutor
    
    async def generate(
        self,
        topic: str,
        num_questions: int = 5,
        criteria: List[str] = []
    ) -> Dict[str, Any]:
        """
        Generate a quiz.
        
        Args:
            topic: The topic to quiz on
            num_questions: Number of questions to generate
            criteria: Assessment criteria
            
        Returns:
            Quiz with questions and metadata
        """
        
        prompt = f"""Generate a {num_questions}-question quiz for Luganda topic: {topic}

Assessment criteria: {', '.join(criteria) if criteria else 'General knowledge'}

For each question provide:
- Question text
- 4 multiple choice options
- Correct answer
- Points (1-3 based on difficulty)

Make questions progressively harder."""
        
        try:
            if self.tutor.model:
                response = await self.tutor.chat(prompt, [], [])
                return self._parse_quiz(response["response"], num_questions)
            else:
                return self._mock_quiz(num_questions)
        except Exception as e:
            logger.error(f"Quiz generation error: {e}")
            return self._mock_quiz(num_questions)
    
    def _parse_quiz(self, content: str, num: int) -> Dict[str, Any]:
        """Parse AI response into structured quiz."""
        # For now, return mock quiz
        # TODO: Implement proper parsing
        return self._mock_quiz(num)
    
    def _mock_quiz(self, num: int = 5) -> Dict[str, Any]:
        """Generate mock quiz."""
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
            },
            {
                "id": 6,
                "question": "Which greeting shows the most respect to elders?",
                "options": ["Oli otya", "Wasuze otya", "Using plural forms", "Webale"],
                "correctAnswer": "Using plural forms",
                "points": 3
            }
        ]
        
        questions = all_questions[:num]
        total_points = sum(q["points"] for q in questions)
        
        return {
            "questions": questions,
            "totalPoints": total_points,
            "timeLimit": num * 60  # 1 minute per question
        }
