"""
Centralized error handling utilities.
Provides custom exception handlers and error response formatting.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from pydantic import ValidationError
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class CustomHTTPException(HTTPException):
    """Custom HTTP exception with additional context."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str = None,
        context: Dict[str, Any] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.context = context or {}


class DatabaseError(CustomHTTPException):
    """Database operation error."""
    
    def __init__(self, detail: str = "Database operation failed", context: Dict[str, Any] = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="DATABASE_ERROR",
            context=context
        )


class ValidationError(CustomHTTPException):
    """Data validation error."""
    
    def __init__(self, detail: str = "Validation failed", context: Dict[str, Any] = None):
        super().__init__(
            status_code=422,
            detail=detail,
            error_code="VALIDATION_ERROR",
            context=context
        )


class NotFoundError(CustomHTTPException):
    """Resource not found error."""
    
    def __init__(self, resource: str = "Resource", context: Dict[str, Any] = None):
        super().__init__(
            status_code=404,
            detail=f"{resource} not found",
            error_code="NOT_FOUND",
            context=context
        )


class UnauthorizedError(CustomHTTPException):
    """Authentication error."""
    
    def __init__(self, detail: str = "Authentication required", context: Dict[str, Any] = None):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code="UNAUTHORIZED",
            context=context
        )


class ForbiddenError(CustomHTTPException):
    """Authorization error."""
    
    def __init__(self, detail: str = "Access forbidden", context: Dict[str, Any] = None):
        super().__init__(
            status_code=403,
            detail=detail,
            error_code="FORBIDDEN",
            context=context
        )


def setup_error_handlers(app: FastAPI) -> None:
    """
    Setup custom error handlers for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    
    @app.exception_handler(CustomHTTPException)
    async def custom_http_exception_handler(request: Request, exc: CustomHTTPException):
        """Handle custom HTTP exceptions."""
        logger.error(f"Custom HTTP Exception: {exc.detail}", extra={
            "error_code": exc.error_code,
            "context": exc.context,
            "path": request.url.path,
            "method": request.method
        })
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail,
                "error_code": exc.error_code,
                "context": exc.context
            }
        )
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle standard HTTP exceptions."""
        logger.warning(f"HTTP Exception: {exc.detail}", extra={
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        })
        
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle request validation errors."""
        logger.warning(f"Validation Error: {exc.errors()}", extra={
            "path": request.url.path,
            "method": request.method
        })
        
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Validation failed",
                "errors": exc.errors()
            }
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(request: Request, exc: SQLAlchemyError):
        """Handle database errors."""
        logger.error(f"Database Error: {str(exc)}", extra={
            "path": request.url.path,
            "method": request.method
        })
        
        if isinstance(exc, IntegrityError):
            return JSONResponse(
                status_code=409,
                content={
                    "detail": "Database integrity constraint violated",
                    "error_code": "INTEGRITY_ERROR"
                }
            )
        
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Database operation failed",
                "error_code": "DATABASE_ERROR"
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        logger.error(f"Unexpected Error: {str(exc)}", extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        }, exc_info=True)
        
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error_code": "INTERNAL_ERROR"
            }
        )
