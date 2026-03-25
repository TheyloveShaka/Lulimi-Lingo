"""
Lulimi Lingo - Model Fine-Tuning Script
========================================
Fine-tunes Gemma-2B on Luganda teaching data using LoRA.
"""

import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from loguru import logger
import json
from pathlib import Path


class LugandaModelTrainer:
    """Fine-tune a language model for Luganda teaching."""
    
    def __init__(
        self,
        base_model: str = "google/gemma-2b-it",
        training_data_path: str = "./data/training/luganda_training_data.json",
        output_dir: str = "./models/luganda-tutor",
        use_4bit: bool = True
    ):
        self.base_model = base_model
        self.training_data_path = training_data_path
        self.output_dir = output_dir
        self.use_4bit = use_4bit
        
        self.model = None
        self.tokenizer = None
        self.dataset = None
    
    def load_model_and_tokenizer(self):
        """Load base model and tokenizer with quantization."""
        logger.info(f"Loading base model: {self.base_model}")
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.base_model,
            trust_remote_code=True
        )
        self.tokenizer.pad_token = self.tokenizer.eos_token
        self.tokenizer.padding_side = "right"
        
        # Quantization config for efficient training
        if self.use_4bit:
            from transformers import BitsAndBytesConfig
            
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True
            )
            
            # Load model with 4-bit quantization
            self.model = AutoModelForCausalLM.from_pretrained(
                self.base_model,
                quantization_config=bnb_config,
                device_map="auto",
                trust_remote_code=True
            )
        else:
            # Load model normally
            self.model = AutoModelForCausalLM.from_pretrained(
                self.base_model,
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True
            )
        
        # Prepare model for k-bit training
        self.model = prepare_model_for_kbit_training(self.model)
        
        logger.info("Model and tokenizer loaded!")
    
    def configure_lora(self):
        """Configure LoRA for efficient fine-tuning."""
        logger.info("Configuring LoRA...")
        
        # LoRA configuration
        lora_config = LoraConfig(
            r=16,  # Rank
            lora_alpha=32,  # Alpha
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # Which layers to train
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM"
        )
        
        # Apply LoRA to model
        self.model = get_peft_model(self.model, lora_config)
        
        # Print trainable parameters
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        total_params = sum(p.numel() for p in self.model.parameters())
        
        logger.info(f"Trainable params: {trainable_params:,} ({100 * trainable_params / total_params:.2f}%)")
        print(f"\n✅ LoRA configured!")
        print(f"   Trainable parameters: {trainable_params:,} / {total_params:,}")
        print(f"   Training only {100 * trainable_params / total_params:.2f}% of model!")
    
    def load_training_data(self):
        """Load and prepare training data."""
        logger.info(f"Loading training data from {self.training_data_path}")
        
        # Load dataset
        self.dataset = load_dataset('json', data_files=self.training_data_path, split='train')
        
        # Format data for training
        def format_instruction(example):
            """Format data in instruction-following format."""
            instruction = example['instruction']
            input_text = example.get('input', '')
            output = example['output']
            
            if input_text:
                prompt = f"### Instruction:\n{instruction}\n\n### Input:\n{input_text}\n\n### Response:\n{output}"
            else:
                prompt = f"### Instruction:\n{instruction}\n\n### Response:\n{output}"
            
            return {"text": prompt}
        
        # Apply formatting
        self.dataset = self.dataset.map(format_instruction)
        
        # Tokenize
        def tokenize_function(examples):
            return self.tokenizer(
                examples["text"],
                padding="max_length",
                truncation=True,
                max_length=512
            )
        
        self.dataset = self.dataset.map(
            tokenize_function,
            batched=True,
            remove_columns=self.dataset.column_names
        )
        
        logger.info(f"Dataset prepared with {len(self.dataset)} examples")
        print(f"\n✅ Training data loaded!")
        print(f"   Examples: {len(self.dataset)}")
    
    def train(
        self,
        num_epochs: int = 3,
        batch_size: int = 4,
        learning_rate: float = 2e-4,
        save_steps: int = 50
    ):
        """Fine-tune the model."""
        logger.info("Starting training...")
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            num_train_epochs=num_epochs,
            per_device_train_batch_size=batch_size,
            gradient_accumulation_steps=4,
            learning_rate=learning_rate,
            fp16=True,
            save_steps=save_steps,
            logging_steps=10,
            save_total_limit=3,
            push_to_hub=False,
            report_to="none",
            warmup_steps=50,
            optim="paged_adamw_8bit"
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=self.dataset,
            data_collator=data_collator
        )
        
        print(f"\n🚀 Training started!")
        print(f"   Epochs: {num_epochs}")
        print(f"   Batch size: {batch_size}")
        print(f"   Learning rate: {learning_rate}")
        print(f"   Output: {self.output_dir}")
        print(f"\n{'='*60}")
        
        # Train!
        trainer.train()
        
        print(f"\n{'='*60}")
        print(f"✅ Training complete!")
        
        # Save model
        logger.info(f"Saving model to {self.output_dir}")
        trainer.save_model(self.output_dir)
        self.tokenizer.save_pretrained(self.output_dir)
        
        print(f"✅ Model saved to {self.output_dir}")
    
    def test_model(self):
        """Test the fine-tuned model with a sample query."""
        logger.info("Testing model...")
        
        test_prompt = "### Instruction:\nHow do you say 'hello' in Luganda?\n\n### Response:\n"
        
        inputs = self.tokenizer(test_prompt, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.split("### Response:\n")[-1]
        
        print(f"\n{'='*60}")
        print(f"🧪 Test Query:")
        print(f"   Q: How do you say 'hello' in Luganda?")
        print(f"\n   A: {response}")
        print(f"{'='*60}")


def main():
    """Main training pipeline."""
    
    print("=" * 60)
    print("Lulimi Lingo - Model Fine-Tuning")
    print("=" * 60)
    
    # Check if training data exists
    base_dir = Path(__file__).parent.parent
    data_path = base_dir / "data" / "training" / "luganda_training_data.json"
    
    if not data_path.exists():
        print(f"\n❌ Error: Training data not found at {data_path}")
        print(f"   Run 'python training/prepare_data.py' first!")
        return
    
    # Check for GPU
    if torch.cuda.is_available():
        print(f"\n✅ GPU detected: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
    else:
        print(f"\n⚠️  No GPU detected - training will be slow on CPU")
        print(f"   Consider using Google Colab for free GPU access")
        response = input(f"\n   Continue anyway? (y/n): ")
        if response.lower() != 'y':
            return
    
    # Initialize trainer
    trainer = LugandaModelTrainer(
        base_model="google/gemma-2b-it",
        training_data_path=str(data_path),
        output_dir=str(base_dir / "models" / "luganda-tutor"),
        use_4bit=True
    )
    
    # Training pipeline
    try:
        print(f"\n📦 Step 1: Loading model...")
        trainer.load_model_and_tokenizer()
        
        print(f"\n⚙️  Step 2: Configuring LoRA...")
        trainer.configure_lora()
        
        print(f"\n📚 Step 3: Loading training data...")
        trainer.load_training_data()
        
        print(f"\n🎯 Step 4: Fine-tuning...")
        trainer.train(
            num_epochs=3,
            batch_size=4,
            learning_rate=2e-4
        )
        
        print(f"\n🧪 Step 5: Testing model...")
        trainer.test_model()
        
        print(f"\n✨ All done! Your Luganda AI teacher is ready!")
        print(f"   Model location: {trainer.output_dir}")
        print(f"\n   To use it, update backend/.env:")
        print(f"   AI_PROVIDER=local")
        print(f"   LOCAL_MODEL_PATH={trainer.output_dir}")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        print(f"\n❌ Error: {e}")
        print(f"\n   Try reducing batch_size or using Google Colab")


if __name__ == "__main__":
    main()
