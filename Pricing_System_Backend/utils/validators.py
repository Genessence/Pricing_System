"""
Custom validators for data validation and business rules.
"""

import re
from typing import Any, Optional, List, Dict
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
import logging

from models.enums import CommodityTypes, RFQStatus, UserRoles, SupplierStatus, AttachmentType

logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Custom validation error."""
    pass


def validate_required(value: Any, field_name: str) -> None:
    """
    Validate that a required field is not None or empty.
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is None or empty
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        raise ValidationError(f"{field_name} is required")


def validate_string_length(value: str, field_name: str, min_length: int = 1, max_length: int = 255) -> None:
    """
    Validate string length.
    
    Args:
        value: String to validate
        field_name: Name of the field for error message
        min_length: Minimum length
        max_length: Maximum length
        
    Raises:
        ValidationError: If length is invalid
    """
    if not isinstance(value, str):
        raise ValidationError(f"{field_name} must be a string")
    
    if len(value) < min_length:
        raise ValidationError(f"{field_name} must be at least {min_length} characters long")
    
    if len(value) > max_length:
        raise ValidationError(f"{field_name} must be no more than {max_length} characters long")


def validate_email(email: str) -> None:
    """
    Validate email format.
    
    Args:
        email: Email to validate
        
    Raises:
        ValidationError: If email format is invalid
    """
    if not email:
        raise ValidationError("Email is required")
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")


def validate_phone(phone: str) -> None:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number to validate
        
    Raises:
        ValidationError: If phone format is invalid
    """
    if not phone:
        return  # Phone is optional
    
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    if len(digits_only) < 7 or len(digits_only) > 15:
        raise ValidationError("Phone number must be between 7 and 15 digits")


def validate_positive_number(value: Any, field_name: str) -> None:
    """
    Validate that a number is positive.
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is not a positive number
    """
    try:
        num = float(value)
        if num <= 0:
            raise ValidationError(f"{field_name} must be a positive number")
    except (ValueError, TypeError):
        raise ValidationError(f"{field_name} must be a valid number")


def validate_non_negative_number(value: Any, field_name: str) -> None:
    """
    Validate that a number is non-negative.
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is not a non-negative number
    """
    try:
        num = float(value)
        if num < 0:
            raise ValidationError(f"{field_name} must be a non-negative number")
    except (ValueError, TypeError):
        raise ValidationError(f"{field_name} must be a valid number")


def validate_decimal(value: Any, field_name: str, precision: int = 2) -> None:
    """
    Validate decimal value with precision.
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        precision: Number of decimal places
        
    Raises:
        ValidationError: If decimal format is invalid
    """
    try:
        decimal_value = Decimal(str(value))
        # Check if decimal places exceed precision
        if decimal_value.as_tuple().exponent < -precision:
            raise ValidationError(f"{field_name} cannot have more than {precision} decimal places")
    except (ValueError, InvalidOperation):
        raise ValidationError(f"{field_name} must be a valid decimal number")


def validate_enum_value(value: Any, enum_class: type, field_name: str) -> None:
    """
    Validate enum value.
    
    Args:
        value: Value to validate
        enum_class: Enum class to validate against
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is not a valid enum value
    """
    if not hasattr(enum_class, value):
        valid_values = [e.value for e in enum_class]
        raise ValidationError(f"{field_name} must be one of: {', '.join(valid_values)}")


def validate_commodity_type(commodity_type: str) -> None:
    """
    Validate commodity type.
    
    Args:
        commodity_type: Commodity type to validate
        
    Raises:
        ValidationError: If commodity type is invalid
    """
    validate_enum_value(commodity_type, CommodityTypes, "Commodity type")


def validate_rfq_status(status: str) -> None:
    """
    Validate RFQ status.
    
    Args:
        status: RFQ status to validate
        
    Raises:
        ValidationError: If RFQ status is invalid
    """
    validate_enum_value(status, RFQStatus, "RFQ status")


def validate_user_role(role: str) -> None:
    """
    Validate user role.
    
    Args:
        role: User role to validate
        
    Raises:
        ValidationError: If user role is invalid
    """
    validate_enum_value(role, UserRoles, "User role")


def validate_supplier_status(status: str) -> None:
    """
    Validate supplier status.
    
    Args:
        status: Supplier status to validate
        
    Raises:
        ValidationError: If supplier status is invalid
    """
    validate_enum_value(status, SupplierStatus, "Supplier status")


def validate_attachment_type(attachment_type: str) -> None:
    """
    Validate attachment type.
    
    Args:
        attachment_type: Attachment type to validate
        
    Raises:
        ValidationError: If attachment type is invalid
    """
    validate_enum_value(attachment_type, AttachmentType, "Attachment type")


def validate_date_range(start_date: date, end_date: date, field_name: str = "Date range") -> None:
    """
    Validate date range.
    
    Args:
        start_date: Start date
        end_date: End date
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If date range is invalid
    """
    if start_date > end_date:
        raise ValidationError(f"{field_name}: Start date cannot be after end date")


def validate_future_date(date_value: date, field_name: str) -> None:
    """
    Validate that date is in the future.
    
    Args:
        date_value: Date to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If date is not in the future
    """
    if date_value <= date.today():
        raise ValidationError(f"{field_name} must be in the future")


def validate_past_date(date_value: date, field_name: str) -> None:
    """
    Validate that date is in the past.
    
    Args:
        date_value: Date to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If date is not in the past
    """
    if date_value >= date.today():
        raise ValidationError(f"{field_name} must be in the past")


def validate_uuid_format(uuid_string: str, field_name: str) -> None:
    """
    Validate UUID format.
    
    Args:
        uuid_string: UUID string to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If UUID format is invalid
    """
    import uuid
    try:
        uuid.UUID(uuid_string)
    except ValueError:
        raise ValidationError(f"{field_name} must be a valid UUID")


def validate_password_strength(password: str) -> None:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        
    Raises:
        ValidationError: If password doesn't meet strength requirements
    """
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValidationError("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        raise ValidationError("Password must contain at least one digit")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError("Password must contain at least one special character")


def validate_file_extension(filename: str, allowed_extensions: List[str]) -> None:
    """
    Validate file extension.
    
    Args:
        filename: Filename to validate
        allowed_extensions: List of allowed extensions
        
    Raises:
        ValidationError: If file extension is not allowed
    """
    if not filename:
        raise ValidationError("Filename is required")
    
    file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
    
    if file_extension not in allowed_extensions:
        raise ValidationError(f"File extension must be one of: {', '.join(allowed_extensions)}")


def validate_file_size(file_size: int, max_size: int, field_name: str = "File") -> None:
    """
    Validate file size.
    
    Args:
        file_size: File size in bytes
        max_size: Maximum allowed size in bytes
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If file size exceeds limit
    """
    if file_size > max_size:
        max_size_mb = max_size / (1024 * 1024)
        raise ValidationError(f"{field_name} size cannot exceed {max_size_mb:.1f} MB")


def validate_rating(rating: int, field_name: str = "Rating") -> None:
    """
    Validate rating value.
    
    Args:
        rating: Rating to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If rating is invalid
    """
    if not isinstance(rating, int):
        raise ValidationError(f"{field_name} must be an integer")
    
    if rating < 1 or rating > 5:
        raise ValidationError(f"{field_name} must be between 1 and 5")


def validate_percentage(percentage: float, field_name: str = "Percentage") -> None:
    """
    Validate percentage value.
    
    Args:
        percentage: Percentage to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If percentage is invalid
    """
    if percentage < 0 or percentage > 100:
        raise ValidationError(f"{field_name} must be between 0 and 100")


def validate_business_rules(data: Dict[str, Any]) -> None:
    """
    Validate business rules for complex data.
    
    Args:
        data: Data dictionary to validate
        
    Raises:
        ValidationError: If business rules are violated
    """
    # Example business rules validation
    if 'rfq_data' in data:
        rfq_data = data['rfq_data']
        
        # Validate RFQ business rules
        if rfq_data.get('status') == 'APPROVED' and not rfq_data.get('approved_by'):
            raise ValidationError("RFQ cannot be approved without an approver")
        
        if rfq_data.get('total_value', 0) <= 0:
            raise ValidationError("RFQ total value must be greater than 0")
    
    if 'vendor_data' in data:
        vendor_data = data['vendor_data']
        
        # Validate vendor business rules
        if vendor_data.get('status') == 'ACTIVE' and not vendor_data.get('contact_email'):
            raise ValidationError("Active vendor must have contact email")
    
    if 'user_data' in data:
        user_data = data['user_data']
        
        # Validate user business rules
        if user_data.get('role') == 'ADMIN' and not user_data.get('site_id'):
            raise ValidationError("Admin user must be assigned to a site")


def validate_data_integrity(data: Dict[str, Any]) -> None:
    """
    Validate data integrity constraints.
    
    Args:
        data: Data dictionary to validate
        
    Raises:
        ValidationError: If data integrity is violated
    """
    # Check for required relationships
    if 'rfq_id' in data and 'vendor_ids' in data:
        if not data['vendor_ids']:
            raise ValidationError("RFQ must have at least one vendor")
    
    # Check for circular references
    if 'parent_id' in data and 'id' in data:
        if data['parent_id'] == data['id']:
            raise ValidationError("Item cannot reference itself as parent")
    
    # Check for logical constraints
    if 'start_date' in data and 'end_date' in data:
        if data['start_date'] and data['end_date']:
            validate_date_range(data['start_date'], data['end_date'], "Date range")
