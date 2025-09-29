"""
Rate limiting middleware.
Implements in-memory rate limiting for API endpoints.
"""

from fastapi import Request
from typing import Dict, Tuple
import time
import asyncio
from collections import defaultdict, deque
from config.settings import settings


class RateLimiter:
    """
    In-memory rate limiter using sliding window algorithm.
    """
    
    def __init__(self, requests: int = 100, window: int = 60):
        """
        Initialize rate limiter.
        
        Args:
            requests: Maximum number of requests allowed
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window
        self.clients: Dict[str, deque] = defaultdict(deque)
        self._lock = asyncio.Lock()
    
    async def is_allowed(self, request: Request) -> bool:
        """
        Check if request is allowed based on rate limiting rules.
        
        Args:
            request: FastAPI request object
            
        Returns:
            bool: True if request is allowed, False otherwise
        """
        # Get client identifier (IP address)
        client_ip = request.client.host if request.client else "unknown"
        
        async with self._lock:
            now = time.time()
            client_requests = self.clients[client_ip]
            
            # Remove old requests outside the window
            while client_requests and client_requests[0] <= now - self.window:
                client_requests.popleft()
            
            # Check if limit is exceeded
            if len(client_requests) >= self.requests:
                return False
            
            # Add current request
            client_requests.append(now)
            return True
    
    def get_client_stats(self, client_ip: str) -> Dict[str, int]:
        """
        Get rate limiting statistics for a client.
        
        Args:
            client_ip: Client IP address
            
        Returns:
            Dict containing request count and remaining requests
        """
        now = time.time()
        client_requests = self.clients[client_ip]
        
        # Clean old requests
        while client_requests and client_requests[0] <= now - self.window:
            client_requests.popleft()
        
        return {
            "requests_made": len(client_requests),
            "requests_remaining": max(0, self.requests - len(client_requests)),
            "window_seconds": self.window
        }
