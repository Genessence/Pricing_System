"""
CORS middleware configuration.
Handles Cross-Origin Resource Sharing for the API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
import logging

logger = logging.getLogger(__name__)


def setup_cors(app: FastAPI) -> None:
    """
    Setup CORS middleware for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    # Configure CORS based on environment
    if settings.DEBUG:
        # Development: Allow all origins
        allowed_origins = ["*"]
        logger.info("CORS: Development mode - allowing all origins")
    else:
        # Production: Use configured origins
        allowed_origins = settings.CORS_ORIGINS
        logger.info(f"CORS: Production mode - allowing origins: {allowed_origins}")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
        expose_headers=[
            "X-Process-Time",
            "X-Total-Count", 
            "X-Page-Count",
            "X-Request-ID"
        ],
        max_age=3600  # Cache preflight requests for 1 hour
    )
    
    logger.info("CORS middleware configured successfully")
