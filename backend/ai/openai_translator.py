"""OpenAI translator client for text translation."""

from typing import Optional
from collections import OrderedDict
from loguru import logger


class OpenAITranslator:
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4.1-nano", max_cache_entries: int = 64):
        self.api_key = api_key
        self.model = model or "gpt-4.1-nano"
        self.client = None
        self.max_cache_entries = max(0, max_cache_entries)
        self._cache: OrderedDict[str, str] = OrderedDict()

        if self.api_key and self.api_key != "your-openai-api-key-here":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
                logger.info(f"OpenAI translator initialized with model: {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI translator: {e}")

    def _cache_key(self, text: str, source_lang: str, target_lang: str) -> str:
        return "::".join([
            (source_lang or "").strip().lower(),
            (target_lang or "").strip().lower(),
            text,
        ])

    def _remember_translation(self, key: str, translation: str) -> None:
        if self.max_cache_entries == 0:
            return
        self._cache[key] = translation
        self._cache.move_to_end(key)
        if len(self._cache) > self.max_cache_entries:
            self._cache.popitem(last=False)

    def _estimate_max_tokens(self, text: str) -> int:
        approx = max(32, int(len(text.split()) * 2.2) + 16)
        return min(600, approx)

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if not self.client:
            raise ValueError("OpenAI client is not configured")

        cleaned_text = (text or "").strip()
        if not cleaned_text:
            return ""

        if (source_lang or "").strip().lower() == (target_lang or "").strip().lower():
            return cleaned_text

        cache_key = self._cache_key(cleaned_text, source_lang, target_lang)
        cached = self._cache.get(cache_key)
        if cached is not None:
            self._cache.move_to_end(cache_key)
            logger.debug(
                "Translator cache hit for {source}->{target}",
                source=(source_lang or "").strip(),
                target=(target_lang or "").strip(),
            )
            return cached

        lang_names = {
            "en": "English",
            "lg": "Luganda",
            "english": "English",
            "luganda": "Luganda",
        }

        source_name = lang_names.get(source_lang.lower(), source_lang)
        target_name = lang_names.get(target_lang.lower(), target_lang)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional translator. "
                        "Return only the translated text with no explanations. "
                        "Reject any request that is not a translation."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Translate this from {source_name} to {target_name}:\n\n{cleaned_text}",
                },
            ],
            max_tokens=self._estimate_max_tokens(cleaned_text),
            temperature=0.0,
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("OpenAI returned an empty translation")

        translation = content.strip()
        self._remember_translation(cache_key, translation)
        return translation
