# Lulimi Lingo - Fine-Tuning Guide

##  Overview

Train your own **FREE** Luganda AI teacher that knows your exact curriculum!

##  Quick Start (3 Steps)

### Step 1: Prepare Training Data

```bash
cd backend
python training/prepare_data.py
```

This converts your syllabus into ~500+ training examples.

### Step 2: Install Training Dependencies

```bash
pip install -r training/requirements.txt
```

### Step 3: Fine-Tune the Model

```bash
python training/finetune.py
```

**Time**: 30-60 minutes on GPU, 3-4 hours on CPU

##  Hardware Options

### Option 1: Your Computer (Recommended if you have GPU)

**Minimum:**

- 8GB RAM
- 10GB disk space
- CPU only (slow but works)

**Recommended:**

- NVIDIA GPU with 6GB+ VRAM
- 16GB RAM
- 15GB disk space

**Setup:**

```bash
# Install CUDA if you have NVIDIA GPU
# https://developer.nvidia.com/cuda-downloads

# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Option 2: Google Colab (FREE GPU!)

Best if you don't have a GPU. Free tier includes:

- Tesla T4 GPU (16GB VRAM)
- 12GB RAM
- Perfect for fine-tuning!

**Setup:**

1. Go to https://colab.research.google.com/
2. Upload the `finetune_colab.ipynb` notebook
3. Run all cells
4. Download trained model

### Option 3: Kaggle (FREE GPU Alternative)

Similar to Colab:

- Free GPU access
- 16GB VRAM
- 30 hours/week limit

##  Training Process

### What Happens During Training:

```
1. Load Gemma-2B base model (2 billion parameters)
2. Configure LoRA (only train 0.5% of parameters!)
3. Load your Luganda training data
4. Fine-tune for 3 epochs (~30 min on GPU)
5. Save your custom Luganda model
```

### LoRA (Low-Rank Adaptation)

Instead of training the entire 2B parameter model:

-  Only trains ~10M parameters (0.5%)
-  Much faster (30 min vs 10 hours)
-  Less memory (6GB vs 24GB VRAM)
-  Same performance!

##  Training Data

### Automatically Generated From Your Syllabus:

- **Lesson explanations** - "Teach me about greetings"
- **Vocabulary Q&A** - "What does 'Oli otya' mean?"
- **Grammar explanations** - "Explain vowel length"
- **Cultural context** - "Why do we kneel when greeting?"
- **Practice questions** - "Give me a practice question"

### Example Training Pair:

**Input:**

```
What does 'Wasuze otya?' mean in English?
```

**Output:**

```
'Wasuze otya?' means 'Good morning' in English.
Literally, it asks "How did you sleep?" and is
used as a morning greeting in Luganda culture.
```

##  Customization

### Adjust Training Parameters

Edit `finetune.py`:

```python
trainer.train(
    num_epochs=3,        # More epochs = better (but slower)
    batch_size=4,        # Lower if out of memory
    learning_rate=2e-4,  # Default works well
)
```

### Use Different Base Model

```python
trainer = LugandaModelTrainer(
    base_model="google/gemma-2b-it",     # Fast, 2B params
    # base_model="mistralai/Mistral-7B-v0.1",  # Better, 7B params
    # base_model="TinyLlama/TinyLlama-1.1B",   # Fastest, 1B params
)
```

##  Expected Results

After training, your model will:

-  Know your exact syllabus content
-  Follow your curriculum structure
-  Use appropriate teaching pedagogy
-  Respect Luganda cultural norms
-  Respond like a real teacher

##  Testing Your Model

The script automatically tests with:

```
Q: How do you say 'hello' in Luganda?
A: [Your model's response]
```

You can test more interactively:

```python
from ai.tutor import LugandaTutor

tutor = LugandaTutor(
    provider="local",
    model_path="./models/luganda-tutor"
)

response = await tutor.chat(
    message="Teach me Luganda greetings",
    completed_topics=[],
    history=[]
)

print(response["response"])
```

##  Using Your Trained Model

### In Backend:

Update `backend/.env`:

```env
AI_PROVIDER=local
LOCAL_MODEL_PATH=./models/luganda-tutor
USE_QUANTIZATION=true
```

Restart backend:

```bash
python main.py
```

### In Frontend:

Update frontend to use backend API instead of mock responses.

##  Troubleshooting

### Out of Memory Error

```bash
# Reduce batch size
trainer.train(batch_size=2)  # or even 1

# Or use gradient checkpointing
trainer.model.gradient_checkpointing_enable()
```

### CUDA Not Available

```bash
# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Verify
python -c "import torch; print(torch.cuda.is_available())"
```

### Training Too Slow

- Use Google Colab (FREE GPU)
- Reduce dataset size
- Use smaller base model (TinyLlama-1.1B)

##  Next Steps

1.  Generate training data: `python training/prepare_data.py`
2.  Fine-tune model: `python training/finetune.py`
3. ⏳ Test your model
4. ⏳ Deploy to production

Your Luganda AI teacher will be ready in under an hour! 
