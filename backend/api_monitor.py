"""
API Usage Monitor for Lulimi Lingo
===================================
Tracks API usage, rate limits, and costs across all providers.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from collections import deque
import json
import os
from pathlib import Path
from loguru import logger


@dataclass
class APIUsage:
    """Tracks usage for a single API provider."""
    provider: str
    total_requests: int = 0
    failed_requests: int = 0
    total_tokens: int = 0
    estimated_cost: float = 0.0
    last_request_time: Optional[datetime] = None
    request_history: deque = field(default_factory=lambda: deque(maxlen=1000))
    
    def add_request(self, tokens: int = 0, cost: float = 0.0, success: bool = True):
        """Record a new API request."""
        self.total_requests += 1
        if not success:
            self.failed_requests += 1
        self.total_tokens += tokens
        self.estimated_cost += cost
        self.last_request_time = datetime.now()
        self.request_history.append({
            "timestamp": datetime.now().isoformat(),
            "tokens": tokens,
            "cost": cost,
            "success": success
        })
    
    def get_requests_in_window(self, minutes: int) -> int:
        """Count requests in the last N minutes."""
        cutoff = datetime.now() - timedelta(minutes=minutes)
        count = 0
        for req in self.request_history:
            req_time = datetime.fromisoformat(req["timestamp"])
            if req_time > cutoff:
                count += 1
        return count
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            "provider": self.provider,
            "total_requests": self.total_requests,
            "failed_requests": self.failed_requests,
            "total_tokens": self.total_tokens,
            "estimated_cost": round(self.estimated_cost, 4),
            "success_rate": round((self.total_requests - self.failed_requests) / max(self.total_requests, 1) * 100, 2),
            "last_request": self.last_request_time.isoformat() if self.last_request_time else None,
            "requests_last_minute": self.get_requests_in_window(1),
            "requests_last_hour": self.get_requests_in_window(60),
        }


class APIMonitor:
    """Central API monitoring system."""
    
    def __init__(self, storage_path: str = "./data/api_usage.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.providers: Dict[str, APIUsage] = {
            "gemini": APIUsage("Gemini API"),
            "openai": APIUsage("OpenAI API")
        }
        
        # Rate limits (requests per minute)
        self.rate_limits = {
            "gemini": 15,  # Free tier
            "openai": 60  # Depends on tier
        }
        
        # Cost per 1K tokens (USD)
        self.token_costs = {
            "gemini": 0.0,  # Free tier
            "openai": 0.0002,  # gpt-4o-nano demo estimate
        }
        
        self._load_state()
    
    def record_request(
        self, 
        provider: str, 
        tokens: int = 0, 
        success: bool = True,
        custom_cost: Optional[float] = None
    ):
        """Record an API request."""
        if provider not in self.providers:
            logger.warning(f"Unknown provider: {provider}")
            return
        
        # Calculate cost
        cost = custom_cost if custom_cost is not None else (tokens / 1000 * self.token_costs.get(provider, 0))
        
        # Record the request
        self.providers[provider].add_request(tokens, cost, success)
        
        # Check rate limits
        self._check_rate_limit(provider)
        
        # Auto-save periodically
        if self.providers[provider].total_requests % 10 == 0:
            self._save_state()
    
    def _check_rate_limit(self, provider: str):
        """Check if approaching rate limit."""
        usage = self.providers[provider]
        limit = self.rate_limits.get(provider, float('inf'))
        
        requests_last_minute = usage.get_requests_in_window(1)
        
        if requests_last_minute >= limit * 0.8:  # 80% of limit
            logger.warning(
                f"⚠️  {provider.upper()} approaching rate limit: "
                f"{requests_last_minute}/{limit} requests in last minute"
            )
        
        if requests_last_minute >= limit:
            logger.error(
                f"🚨 {provider.upper()} RATE LIMIT EXCEEDED: "
                f"{requests_last_minute}/{limit} requests in last minute. "
                f"Throttling recommended!"
            )
    
    def get_status(self) -> Dict:
        """Get current status of all APIs."""
        return {
            "timestamp": datetime.now().isoformat(),
            "providers": {
                name: usage.to_dict() 
                for name, usage in self.providers.items()
            },
            "rate_limits": self.rate_limits,
            "warnings": self._get_warnings()
        }
    
    def _get_warnings(self) -> List[str]:
        """Generate warning messages."""
        warnings = []
        
        for name, usage in self.providers.items():
            limit = self.rate_limits.get(name, float('inf'))
            recent = usage.get_requests_in_window(1)
            
            if recent >= limit * 0.8:
                warnings.append(
                    f"{name}: {recent}/{limit} requests/min (approaching limit)"
                )
            
            if usage.failed_requests > usage.total_requests * 0.1:
                warnings.append(
                    f"{name}: High failure rate "
                    f"({usage.failed_requests}/{usage.total_requests})"
                )
        
        return warnings
    
    def _save_state(self):
        """Save usage data to disk."""
        try:
            data = {
                "last_updated": datetime.now().isoformat(),
                "providers": {
                    name: {
                        "total_requests": usage.total_requests,
                        "failed_requests": usage.failed_requests,
                        "total_tokens": usage.total_tokens,
                        "estimated_cost": usage.estimated_cost,
                    }
                    for name, usage in self.providers.items()
                }
            }
            
            with open(self.storage_path, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save API usage data: {e}")
    
    def _load_state(self):
        """Load usage data from disk."""
        try:
            if self.storage_path.exists():
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                
                for name, stats in data.get("providers", {}).items():
                    if name in self.providers:
                        self.providers[name].total_requests = stats.get("total_requests", 0)
                        self.providers[name].failed_requests = stats.get("failed_requests", 0)
                        self.providers[name].total_tokens = stats.get("total_tokens", 0)
                        self.providers[name].estimated_cost = stats.get("estimated_cost", 0.0)
                
                logger.info(f"Loaded API usage data from {self.storage_path}")
        
        except Exception as e:
            logger.warning(f"Could not load previous usage data: {e}")
    
    def reset_stats(self, provider: Optional[str] = None):
        """Reset statistics for one or all providers."""
        if provider:
            if provider in self.providers:
                self.providers[provider] = APIUsage(self.providers[provider].provider)
        else:
            for name in self.providers:
                self.providers[name] = APIUsage(self.providers[name].provider)
        
        self._save_state()
    
    def export_report(self, output_path: str = "./data/api_usage_report.json"):
        """Export detailed usage report."""
        report = {
            "generated": datetime.now().isoformat(),
            "summary": self.get_status(),
            "recommendations": self._generate_recommendations()
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"API usage report exported to {output_path}")
        return report
    
    def _generate_recommendations(self) -> List[str]:
        """Generate optimization recommendations."""
        recommendations = []
        
        gemini_usage = self.providers["gemini"]
        if gemini_usage.get_requests_in_window(60) > 100:
            recommendations.append(
                "Consider implementing request caching to reduce Gemini API calls"
            )
        
        total_cost = sum(u.estimated_cost for u in self.providers.values())
        if total_cost > 10:
            recommendations.append(
                f"Total estimated cost: ${total_cost:.2f}. Consider reviewing usage patterns."
            )
        
        for name, usage in self.providers.items():
            if usage.failed_requests > 10 and usage.failed_requests / max(usage.total_requests, 1) > 0.2:
                recommendations.append(
                    f"High failure rate for {name}. Check API key and connectivity."
                )
        
        return recommendations


# Global monitor instance
monitor = APIMonitor()
