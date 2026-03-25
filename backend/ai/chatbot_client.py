"""Chatbot client scaffold.

Plug in whichever conversational model you choose here (OpenAI, Anthropic, self-hosted).
"""
from typing import Any, Dict, Optional
import os

class ChatbotClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("CHATBOT_API_KEY")

    def chat(self, messages: list[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """Send a conversation and receive a reply.

        `messages` is a list like: [{"role": "user", "content": "..."}, ...]
        Replace implementation with provider-specific code.
        """
        # Placeholder: echo last user message
        if not messages:
            return {"reply": ""}
        last = messages[-1].get("content", "")
        return {"reply": f"(stub) Echo: {last}"}

    def answer_question(self, question: str, context: Optional[str] = None) -> str:
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": question})
        resp = self.chat(messages)
        return resp.get("reply", "")
