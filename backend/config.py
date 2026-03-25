"""
Lulimi Lingo - Backend Configuration
=====================================
Loads environment variables and provides configuration settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional, Literal
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    frontend_url: str = "http://localhost:3000"
    
    # AI Provider
    ai_provider: Literal["local", "gemini", "openai"] = "openai"
    
    # Local Model
    local_model_path: str = "./models/luganda-tutor"
    local_model_name: str = "google/gemma-2b-it"
    use_quantization: bool = True
    
    # Gemini
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-flash-latest"
    
    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    
    # Training
    training_data_path: str = "./data/training"
    output_model_path: str = "./models/luganda-tutor"
    epochs: int = 3
    batch_size: int = 4
    learning_rate: float = 2e-4
    max_seq_length: int = 512
    
    # LoRA
    lora_r: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.05
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./data/lulimi_lingo.db"
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/backend.log"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
