class QuoteFlowException(Exception):
    """Base exception for QuoteFlow Pro."""
    pass

class ResourceNotFound(QuoteFlowException):
    """Raised when a requested resource is not found."""
    pass

class PermissionDenied(QuoteFlowException):
    """Raised when user lacks required permissions."""
    pass

class ValidationError(QuoteFlowException):
    """Raised when data validation fails."""
    pass

class BusinessRuleViolation(QuoteFlowException):
    """Raised when business rules are violated."""
    pass
