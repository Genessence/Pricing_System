"""
FastAPI application entry point.
Configures the main application with all routes, middleware, and startup/shutdown events.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
import time
from typing import Dict, Any

from config.settings import settings
from config.database import create_tables, check_database_connection
from config.logging import setup_logging, get_logger, log_request_info
from middleware.cors import setup_cors
from middleware.rate_limiter import RateLimiter
from utils.error_handler import setup_error_handlers
from routes import (
    general_purchase_rfq,
    indent_items,
    users,
    service_items_quotation,
    transport_items_quotation,
    indent_items_quotation,
    vendors,
    service_items,
    transport_items,
    attachments,
    rfq_vendors,
    sites
)

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Check database connection
    if not check_database_connection():
        logger.error("Database connection failed. Application startup aborted.")
        raise Exception("Database connection failed")
    
    # Create database tables
    try:
        create_tables()
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
    
    logger.info("Application startup completed")
    yield
    
    # Shutdown
    logger.info("Application shutdown initiated")
    logger.info("Application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Pricing System with RFQ Management",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan
)

# Setup CORS
setup_cors(app)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)

# Setup error handlers
setup_error_handlers(app)

# Add request timing and logging middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers and log request info."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log request information
    log_request_info(request, response, process_time)
    
    return response

# Add rate limiting middleware
rate_limiter = RateLimiter(
    requests=settings.RATE_LIMIT_REQUESTS,
    window=settings.RATE_LIMIT_WINDOW
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to requests."""
    if not await rate_limiter.is_allowed(request):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
    return await call_next(request)


# Include API routes
app.include_router(
    general_purchase_rfq.router,
    prefix="/api/rfq",
    tags=["RFQ Management"]
)

app.include_router(
    indent_items.router,
    prefix="/api/indent-items",
    tags=["Indent Items"]
)

app.include_router(
    users.router,
    prefix="/api/users",
    tags=["User Management"]
)

app.include_router(
    service_items_quotation.router,
    prefix="/api/service-quotations",
    tags=["Service Quotations"]
)

app.include_router(
    transport_items_quotation.router,
    prefix="/api/transport-quotations",
    tags=["Transport Quotations"]
)

app.include_router(
    indent_items_quotation.router,
    prefix="/api/indent-quotations",
    tags=["Indent Quotations"]
)

app.include_router(
    vendors.router,
    prefix="/api/vendors",
    tags=["Vendor Management"]
)

app.include_router(
    service_items.router,
    prefix="/api/service-items",
    tags=["Service Items"]
)

app.include_router(
    transport_items.router,
    prefix="/api/transport-items",
    tags=["Transport Items"]
)

app.include_router(
    attachments.router,
    prefix="/api/attachments",
    tags=["File Attachments"]
)

app.include_router(
    rfq_vendors.router,
    prefix="/api/rfq-vendors",
    tags=["RFQ Vendors"]
)

app.include_router(
    sites.router,
    prefix="/api/sites",
    tags=["Site Management"]
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": time.time()
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs_url": "/docs" if settings.DEBUG else "Documentation not available in production",
        "health_check": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
