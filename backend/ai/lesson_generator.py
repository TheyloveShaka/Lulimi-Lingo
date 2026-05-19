"""
Lulimi Lingo - Lesson Generator
================================
Generates structured lessons using AI.
"""

from typing import List, Dict, Any
from loguru import logger


class LessonGenerator:
    """Generates AI-powered lessons for Luganda learning."""
    
    def __init__(self, tutor):
        self.tutor = tutor
    
    async def generate(
        self,
        class_level: str,
        term: str,
        week: str,
        topic: str,
        objectives: List[str],
        language: str = 'luganda'
    ) -> Dict[str, Any]:
        """
        Generate a complete lesson.
        
        Args:
            class_level: e.g., "S1", "S2"
            term: e.g., "Term 1"
            week: e.g., "Week 1"
            topic: The lesson topic
            objectives: Learning objectives
            language: The target language (luganda, runyankole, etc.)
            
        Returns:
            Structured lesson content
        """
        
        language_name = 'Runyankole' if language.lower() == 'runyankole' else 'Luganda'
        
        prompt = f"""Generate a {language_name} lesson for:
Class: {class_level}
Term: {term}
Week: {week}
Topic: {topic}
Objectives: {', '.join(objectives) if objectives else 'General introduction to the topic'}

Provide the lesson in this structure:
1. Introduction (2-3 sentences introducing the topic)
2. Explanation (main concept explanation)
3. Examples (5 examples with text in {language_name}, English translation, and usage)
4. Cultural Note (relevant cultural context)
5. Key Points (3-5 key takeaways)

Format your response as JSON."""
        
        try:
            if self.tutor.model:
                response = await self.tutor.chat(prompt, [], [])
                # Parse response into structured format
                return self._parse_lesson(response["response"], topic, language_name)
            else:
                return self._mock_lesson(topic, language_name)
        except Exception as e:
            logger.error(f"Lesson generation error: {e}")
            return self._mock_lesson(topic, language_name)
    
    def _parse_lesson(self, content: str, topic: str, language_name: str = 'Luganda') -> Dict[str, Any]:
        """Parse AI response into structured lesson."""
        # Simple parsing - could be enhanced with more robust parsing
        sections = {
            "introduction": "",
            "explanation": "",
            "examples": [],
            "culturalNote": "",
            "keyPoints": []
        }
        
        lines = content.split('\n')
        current_section = "introduction"
        
        for line in lines:
            line_lower = line.lower()
            if 'introduction' in line_lower:
                current_section = 'introduction'
            elif 'explanation' in line_lower or 'concept' in line_lower:
                current_section = 'explanation'
            elif 'example' in line_lower:
                current_section = 'examples'
            elif 'cultural' in line_lower:
                current_section = 'culturalNote'
            elif 'key point' in line_lower or 'takeaway' in line_lower:
                current_section = 'keyPoints'
            else:
                if current_section == 'examples' and line.strip():
                    sections['examples'].append(line.strip())
                elif current_section == 'keyPoints' and line.strip():
                    sections['keyPoints'].append(line.strip())
                elif current_section in ['introduction', 'explanation', 'culturalNote']:
                    sections[current_section] += line + '\n'
        
        # Clean up
        for key in ['introduction', 'explanation', 'culturalNote']:
            sections[key] = sections[key].strip()
        
        return sections if sections['introduction'] else self._mock_lesson(topic, language_name)
    
    def _mock_lesson(self, topic: str, language_name: str = 'Luganda') -> Dict[str, Any]:
        """Generate mock lesson for development."""
        
        # Language-specific examples
        luganda_examples = [
            {"text": "Oli otya?", "english": "How are you?", "usage": "Informal, to peers"},
            {"text": "Wasuze otya?", "english": "Good morning", "usage": "Morning greeting, asks 'how did you sleep?'"},
            {"text": "Osiibye otya?", "english": "Good afternoon/evening", "usage": "Used after noon"},
            {"text": "Gyendi", "english": "I'm fine", "usage": "Response to greetings"},
            {"text": "Webale", "english": "Thank you", "usage": "Expressing gratitude"}
        ]
        
        runyankole_examples = [
            {"text": f"{language_name} example phrase 1", "english": "English translation", "usage": "Common greeting"},
            {"text": f"{language_name} example phrase 2", "english": "English translation", "usage": "Simple response"},
            {"text": f"{language_name} example phrase 3", "english": "English translation", "usage": "Polite expression"},
            {"text": f"{language_name} example phrase 4", "english": "English translation", "usage": "Thank you"},
            {"text": f"{language_name} example phrase 5", "english": "English translation", "usage": "I'm fine"}
        ]
        
        examples = luganda_examples if language_name == 'Luganda' else runyankole_examples
        
        return {
            "introduction": f"Welcome to today's lesson on {topic}! In {language_name} culture, this topic is very important for daily communication and building relationships.",
            "explanation": f"""{language_name} greetings change based on the time of day and the age of the person you're greeting. It's important to use the correct form to show proper respect.

There are several main types of greetings with different contexts and uses for formal and informal settings.""",
            "examples": examples,
            "culturalNote": f"In {language_name} culture, it's considered rude to jump straight into conversation without proper greetings. Always take time to greet and ask about someone's wellbeing first. Younger people are expected to initiate greetings with elders, and proper respect forms are essential.",
            "keyPoints": [
                "Always greet before starting a conversation",
                f"Use appropriate greetings in {language_name}",
                "Show respect to elders in your greetings",
                "Respond appropriately when greeted",
                "Cultural respect is essential in communication"
            ]
        }
