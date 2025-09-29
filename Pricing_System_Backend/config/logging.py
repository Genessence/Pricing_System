"""
Logging configuration for the application.
"""

import logging
import logging.config
import sys
from pathlib import Path
from typing import Dict, Any
from config.settings import settings


def setup_logging() -> None:
    """
    Setup application logging configuration.
    """
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Logging configuration
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": settings.LOG_FORMAT,
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "json": {
                "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s", "module": "%(module)s", "function": "%(funcName)s", "line": %(lineno)d}',
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "default",
                "stream": sys.stdout
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "detailed",
                "filename": "logs/app.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": "logs/error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5
            },
            "access_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json",
                "filename": "logs/access.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5
            }
        },
        "loggers": {
            "": {  # Root logger
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "app": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "config": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "models": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "schemas": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "services": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "controllers": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "routes": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file", "access_file"],
                "propagate": False
            },
            "middleware": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "utils": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["access_file"],
                "propagate": False
            },
            "uvicorn.error": {
                "level": "ERROR",
                "handlers": ["error_file"],
                "propagate": False
            },
            "sqlalchemy": {
                "level": "WARNING",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "sqlalchemy.engine": {
                "level": "WARNING",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "sqlalchemy.pool": {
                "level": "WARNING",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "fastapi": {
                "level": "INFO",
                "handlers": ["console", "file"],
                "propagate": False
            },
            "pydantic": {
                "level": "WARNING",
                "handlers": ["console", "file"],
                "propagate": False
            }
        }
    }
    
    # Apply logging configuration
    logging.config.dictConfig(logging_config)
    
    # Get logger for this module
    logger = logging.getLogger(__name__)
    logger.info("Logging configuration initialized")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the given name.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)


def log_request_info(request, response=None, process_time=None):
    """
    Log request information.
    
    Args:
        request: FastAPI request object
        response: FastAPI response object (optional)
        process_time: Request processing time (optional)
    """
    logger = get_logger("routes")
    
    log_data = {
        "method": request.method,
        "url": str(request.url),
        "path": request.url.path,
        "query_params": dict(request.query_params),
        "client_ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown")
    }
    
    if response:
        log_data["status_code"] = response.status_code
        log_data["response_size"] = len(response.body) if hasattr(response, 'body') else 0
    
    if process_time:
        log_data["process_time"] = process_time
    
    logger.info(f"Request processed: {log_data}")


def log_error(error: Exception, context: Dict[str, Any] = None):
    """
    Log error information.
    
    Args:
        error: Exception object
        context: Additional context information
    """
    logger = get_logger("utils")
    
    error_data = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context or {}
    }
    
    logger.error(f"Error occurred: {error_data}", exc_info=True)


def log_database_operation(operation: str, table: str, record_id: str = None, success: bool = True):
    """
    Log database operation.
    
    Args:
        operation: Database operation (CREATE, READ, UPDATE, DELETE)
        table: Database table name
        record_id: Record ID (optional)
        success: Operation success status
    """
    logger = get_logger("models")
    
    log_data = {
        "operation": operation,
        "table": table,
        "record_id": record_id,
        "success": success
    }
    
    if success:
        logger.info(f"Database operation: {log_data}")
    else:
        logger.error(f"Database operation failed: {log_data}")


def log_business_operation(operation: str, entity: str, entity_id: str = None, details: Dict[str, Any] = None):
    """
    Log business operation.
    
    Args:
        operation: Business operation name
        entity: Entity type
        entity_id: Entity ID (optional)
        details: Additional details (optional)
    """
    logger = get_logger("services")
    
    log_data = {
        "operation": operation,
        "entity": entity,
        "entity_id": entity_id,
        "details": details or {}
    }
    
    logger.info(f"Business operation: {log_data}")


def log_security_event(event_type: str, user_id: str = None, ip_address: str = None, details: Dict[str, Any] = None):
    """
    Log security-related events.
    
    Args:
        event_type: Type of security event
        user_id: User ID (optional)
        ip_address: IP address (optional)
        details: Additional details (optional)
    """
    logger = get_logger("middleware")
    
    log_data = {
        "event_type": event_type,
        "user_id": user_id,
        "ip_address": ip_address,
        "details": details or {}
    }
    
    logger.warning(f"Security event: {log_data}")


def log_performance_metric(metric_name: str, value: float, unit: str = "ms", context: Dict[str, Any] = None):
    """
    Log performance metrics.
    
    Args:
        metric_name: Name of the metric
        value: Metric value
        unit: Unit of measurement
        context: Additional context (optional)
    """
    logger = get_logger("utils")
    
    log_data = {
        "metric_name": metric_name,
        "value": value,
        "unit": unit,
        "context": context or {}
    }
    
    logger.info(f"Performance metric: {log_data}")
