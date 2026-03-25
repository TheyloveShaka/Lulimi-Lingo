"""
Lulimi Lingo - Training Data Preparation
=========================================
Converts the Luganda syllabus into training examples for fine-tuning.
"""

import json
import os
from typing import List, Dict, Any
from pathlib import Path
from loguru import logger


class TrainingDataGenerator:
    """Generates training data from syllabus for fine-tuning."""
    
    def __init__(self, syllabus_path: str):
        self.syllabus_path = syllabus_path
        self.syllabus_data = self._load_syllabus()
        
        # Training templates
        self.system_prompt = """You are a professional Luganda language teacher and curriculum-aligned tutor.

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

PEDAGOGY:
- One concept at a time
- Short explanations
- Pattern-based teaching
- Examples before rules where possible

LANGUAGE HANDLING:
- English is used for explanations.
- Luganda is used for examples and practice.
- When in doubt, prefer correctness and simplicity over complexity."""
    
    def _load_syllabus(self) -> List[Dict]:
        """Load syllabus JSON data."""
        try:
            with open(self.syllabus_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"Loaded syllabus with {len(data)} entries")
            return data
        except Exception as e:
            logger.error(f"Failed to load syllabus: {e}")
            return []
    
    def generate_training_examples(self) -> List[Dict[str, Any]]:
        """Generate all training examples from syllabus."""
        examples = []
        
        for entry in self.syllabus_data:
            # Generate different types of examples for each syllabus entry
            examples.extend(self._generate_lesson_examples(entry))
            examples.extend(self._generate_vocabulary_examples(entry))
            examples.extend(self._generate_grammar_examples(entry))
            examples.extend(self._generate_cultural_examples(entry))
            examples.extend(self._generate_practice_examples(entry))
        
        logger.info(f"Generated {len(examples)} training examples")
        return examples
    
    def _generate_lesson_examples(self, entry: Dict) -> List[Dict]:
        """Generate lesson request/response examples."""
        examples = []
        
        topic = entry.get('topic', 'Unknown')
        objectives = entry.get('objectives', [])
        vocabulary = entry.get('vocabulary', [])
        
        # Example 1: Lesson introduction request
        user_msg = f"Teach me a lesson about {topic} in Luganda."
        assistant_msg = f"""📘 **Lesson: {topic}**

**Introduction:**
Welcome to today's lesson on {topic}! This topic is fundamental in Luganda language and culture.

**What You'll Learn:**
{chr(10).join(f"- {obj}" for obj in objectives[:3] if objectives)}

**Key Vocabulary:**
{chr(10).join(f"- {vocab}" for vocab in vocabulary[:5] if vocabulary)}

Let's start with the basics. In Luganda, {topic.lower()} is very important for daily communication."""
        
        examples.append({
            "instruction": user_msg,
            "input": "",
            "output": assistant_msg,
            "system": self.system_prompt
        })
        
        return examples
    
    def _generate_vocabulary_examples(self, entry: Dict) -> List[Dict]:
        """Generate vocabulary Q&A examples."""
        examples = []
        vocabulary = entry.get('vocabulary', [])
        
        for vocab_item in vocabulary[:10]:  # Limit to avoid too many examples
            if ' (' in vocab_item and ')' in vocab_item:
                # Parse "Luganda (English)" format
                luganda = vocab_item.split('(')[0].strip()
                english = vocab_item.split('(')[1].replace(')', '').strip()
                
                # Example: Translation request
                examples.append({
                    "instruction": f"What does '{luganda}' mean in English?",
                    "input": "",
                    "output": f"'{luganda}' means '{english}' in English.",
                    "system": self.system_prompt
                })
                
                # Example: Reverse translation
                examples.append({
                    "instruction": f"How do you say '{english}' in Luganda?",
                    "input": "",
                    "output": f"You say '{luganda}' in Luganda.",
                    "system": self.system_prompt
                })
        
        return examples
    
    def _generate_grammar_examples(self, entry: Dict) -> List[Dict]:
        """Generate grammar explanation examples."""
        examples = []
        grammar_focus = entry.get('grammar_focus', [])
        
        for grammar_point in grammar_focus[:3]:
            examples.append({
                "instruction": f"Explain this Luganda grammar concept: {grammar_point}",
                "input": "",
                "output": f"""Let me explain {grammar_point}:

This is an important grammar rule in Luganda. {grammar_point}

Here's how it works:
- First, understand the basic pattern
- Then, practice with simple examples
- Finally, apply it in sentences

Would you like me to give you some practice examples?""",
                "system": self.system_prompt
            })
        
        return examples
    
    def _generate_cultural_examples(self, entry: Dict) -> List[Dict]:
        """Generate cultural context examples."""
        examples = []
        cultural_notes = entry.get('cultural_notes', [])
        topic = entry.get('topic', 'this topic')
        
        for note in cultural_notes[:2]:
            examples.append({
                "instruction": f"What is the cultural significance of {topic} in Luganda culture?",
                "input": "",
                "output": f"""🌍 **Cultural Context:**

In Luganda culture, {topic.lower()} has important cultural significance:

{note}

This cultural practice reflects the values of respect, community, and tradition that are central to Baganda people.

Understanding these cultural aspects will help you use the language more appropriately and respectfully.""",
                "system": self.system_prompt
            })
        
        return examples
    
    def _generate_practice_examples(self, entry: Dict) -> List[Dict]:
        """Generate practice question examples."""
        examples = []
        topic = entry.get('topic', 'Luganda')
        vocabulary = entry.get('vocabulary', [])
        
        if len(vocabulary) >= 2:
            vocab1 = vocabulary[0].split('(')[0].strip() if '(' in vocabulary[0] else vocabulary[0]
            vocab2 = vocabulary[1].split('(')[0].strip() if '(' in vocabulary[1] else vocabulary[1]
            
            examples.append({
                "instruction": f"Give me a practice question about {topic}.",
                "input": "",
                "output": f"""Here's a practice question for you:

**Question:** Fill in the blank with the correct Luganda word:
"______ " (Choose between: {vocab1}, {vocab2})

Take your time and try to answer. When you're ready, I'll check your answer and explain why it's correct or incorrect.

Remember: In Luganda, context is important!""",
                "system": self.system_prompt
            })
        
        return examples
    
    def save_training_data(self, output_path: str, format: str = 'alpaca'):
        """
        Save training data in specified format.
        
        Args:
            output_path: Path to save the training data
            format: 'alpaca' or 'sharegpt'
        """
        examples = self.generate_training_examples()
        
        if format == 'alpaca':
            # Alpaca format: instruction, input, output
            alpaca_data = [
                {
                    "instruction": ex["instruction"],
                    "input": ex.get("input", ""),
                    "output": ex["output"]
                }
                for ex in examples
            ]
            data_to_save = alpaca_data
        
        elif format == 'sharegpt':
            # ShareGPT format: conversations
            sharegpt_data = [
                {
                    "conversations": [
                        {"from": "system", "value": ex["system"]},
                        {"from": "human", "value": ex["instruction"]},
                        {"from": "gpt", "value": ex["output"]}
                    ]
                }
                for ex in examples
            ]
            data_to_save = sharegpt_data
        
        else:
            raise ValueError(f"Unknown format: {format}")
        
        # Save to file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(data_to_save)} examples to {output_path}")
        print(f"\n✅ Training data saved: {output_path}")
        print(f"   Format: {format}")
        print(f"   Examples: {len(data_to_save)}")


def main():
    """Generate training data from syllabus."""
    
    # Paths
    base_dir = Path(__file__).parent.parent.parent  # Go up to project root
    syllabus_path = base_dir / "frontend" / "src" / "data" / "syllabusContent.json"
    output_dir = base_dir / "backend" / "data" / "training"
    
    print("=" * 60)
    print("Lulimi Lingo - Training Data Generator")
    print("=" * 60)
    print(f"\nSyllabus: {syllabus_path}")
    print(f"Output: {output_dir}")
    
    if not syllabus_path.exists():
        print(f"\n❌ Error: Syllabus not found at {syllabus_path}")
        return
    
    # Generate training data
    generator = TrainingDataGenerator(str(syllabus_path))
    
    # Save in Alpaca format (most common for fine-tuning)
    output_file = output_dir / "luganda_training_data.json"
    generator.save_training_data(str(output_file), format='alpaca')
    
    print(f"\n📊 Stats:")
    print(f"   Syllabus entries: {len(generator.syllabus_data)}")
    print(f"   Training examples generated: {len(generator.generate_training_examples())}")
    
    print(f"\n✨ Next step: Run the fine-tuning script!")
    print(f"   python training/finetune.py")


if __name__ == "__main__":
    main()
