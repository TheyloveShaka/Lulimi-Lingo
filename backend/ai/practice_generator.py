"""
Lulimi Lingo - Practice Generator
==================================
Generates practice exercises using AI.
"""

from typing import List, Dict, Any
from loguru import logger


class PracticeGenerator:
    """Generates practice exercises for Luganda learning."""
    
    def __init__(self, tutor):
        self.tutor = tutor
    
    async def generate(
        self,
        topic: str,
        proficiency_level: str = "beginner",
        common_mistakes: List[str] = []
    ) -> List[Dict[str, Any]]:
        """
        Generate practice questions.
        
        Args:
            topic: The topic to practice
            proficiency_level: "beginner", "developing", or "intermediate"
            common_mistakes: List of common mistakes to address
            
        Returns:
            List of practice questions
        """
        
        prompt = f"""Generate 5 practice questions for Luganda topic: {topic}

Proficiency level: {proficiency_level}
{'Address these mistakes: ' + ', '.join(common_mistakes) if common_mistakes else ''}

Include these question types:
1. Fill in the blank
2. Multiple choice
3. Translation
4. Word reordering
5. Matching

For each question provide:
- The question text
- Options (if applicable)
- Correct answer
- A helpful hint"""
        
        try:
            if self.tutor.model:
                response = await self.tutor.chat(prompt, [], [])
                return self._parse_questions(response["response"])
            else:
                return self._mock_questions()
        except Exception as e:
            logger.error(f"Practice generation error: {e}")
            return self._mock_questions()
    
    def _parse_questions(self, content: str) -> List[Dict[str, Any]]:
        """Parse AI response into structured questions."""
        # For now, return mock questions
        # TODO: Implement proper parsing
        return self._mock_questions()
    
    def _mock_questions(self) -> List[Dict[str, Any]]:
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
