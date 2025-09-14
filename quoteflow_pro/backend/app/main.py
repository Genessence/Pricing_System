from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
from app.core.config import settings
from app.core.exceptions import QuoteFlowException, ResourceNotFound, PermissionDenied, ValidationError, BusinessRuleViolation
from app.api.v1 import auth, users, erp_items, rfqs, sites, suppliers, quotations
from datetime import datetime

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Enterprise Procurement Management System API",
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    
    # Configure logging for CORS debugging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_CREDENTIALS,
        allow_methods=settings.CORS_METHODS,
        allow_headers=settings.CORS_HEADERS,
        expose_headers=["*"],
    )
    
    # Add trusted host middleware for security
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )
    
    # Add CORS debugging middleware
    @app.middleware("http")
    async def cors_debug_middleware(request: Request, call_next):
        # Log CORS-related headers
        origin = request.headers.get("origin")
        method = request.method
        path = request.url.path
        
        logger.info(f"CORS Debug - Method: {method}, Path: {path}, Origin: {origin}")
        
        response = await call_next(request)
        
        # Log response headers
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        if cors_headers:
            logger.info(f"CORS Response Headers: {cors_headers}")
        
        return response
    
    # Include routers
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(erp_items.router, prefix="/api/v1/erp-items", tags=["ERP Items"])
    app.include_router(sites.router, prefix="/api/v1/sites", tags=["Sites"])
    app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["Suppliers"])
    app.include_router(quotations.router, prefix="/api/v1/quotations", tags=["Quotations"])
    app.include_router(rfqs.router, prefix="/api/v1/rfqs", tags=["RFQs"])
    
    # Global exception handlers
    @app.exception_handler(ResourceNotFound)
    async def resource_not_found_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={"detail": str(exc)}
        )
    
    @app.exception_handler(PermissionDenied)
    async def permission_denied_handler(request, exc):
        return JSONResponse(
            status_code=403,
            content={"detail": str(exc)}
        )
    
    @app.exception_handler(ValidationError)
    async def validation_error_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)}
        )
    
    @app.exception_handler(BusinessRuleViolation)
    async def business_rule_violation_handler(request, exc):
        return JSONResponse(
            status_code=422,
            content={"detail": str(exc)}
        )
    
    return app

app = create_application()

@app.get("/")
async def root():
    return {
        "message": "QuoteFlow Pro API", 
        "version": settings.VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION
    }
