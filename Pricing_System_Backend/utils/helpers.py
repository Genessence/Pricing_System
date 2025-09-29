"""
Helper utilities for common operations.
"""

import os
import uuid
import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pathlib import Path
import logging

from config.settings import settings

logger = logging.getLogger(__name__)


def generate_uuid() -> str:
    """
    Generate a new UUID string.
    
    Returns:
        UUID string
    """
    return str(uuid.uuid4())


def generate_short_id(length: int = 8) -> str:
    """
    Generate a short random ID.
    
    Args:
        length: Length of the ID
        
    Returns:
        Short random ID string
    """
    return secrets.token_urlsafe(length)


def generate_hash(data: str, algorithm: str = "sha256") -> str:
    """
    Generate hash for given data.
    
    Args:
        data: Data to hash
        algorithm: Hash algorithm to use
        
    Returns:
        Hash string
    """
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(data.encode('utf-8'))
    return hash_obj.hexdigest()


def get_current_timestamp() -> datetime:
    """
    Get current UTC timestamp.
    
    Returns:
        Current UTC datetime
    """
    return datetime.now(timezone.utc)


def format_timestamp(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime to string.
    
    Args:
        dt: Datetime object
        format_str: Format string
        
    Returns:
        Formatted datetime string
    """
    return dt.strftime(format_str)


def parse_timestamp(timestamp_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> Optional[datetime]:
    """
    Parse timestamp string to datetime.
    
    Args:
        timestamp_str: Timestamp string
        format_str: Format string
        
    Returns:
        Datetime object or None if parsing fails
    """
    try:
        return datetime.strptime(timestamp_str, format_str)
    except ValueError:
        logger.error(f"Failed to parse timestamp: {timestamp_str}")
        return None


def ensure_directory_exists(directory_path: str) -> bool:
    """
    Ensure directory exists, create if it doesn't.
    
    Args:
        directory_path: Path to directory
        
    Returns:
        True if directory exists or was created, False otherwise
    """
    try:
        Path(directory_path).mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Failed to create directory {directory_path}: {str(e)}")
        return False


def get_file_extension(filename: str) -> str:
    """
    Get file extension from filename.
    
    Args:
        filename: Name of the file
        
    Returns:
        File extension (without dot)
    """
    return Path(filename).suffix.lstrip('.').lower()


def is_allowed_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Check if file type is allowed.
    
    Args:
        filename: Name of the file
        allowed_extensions: List of allowed extensions
        
    Returns:
        True if file type is allowed, False otherwise
    """
    file_extension = get_file_extension(filename)
    return file_extension in allowed_extensions


def get_file_size_mb(file_path: str) -> float:
    """
    Get file size in MB.
    
    Args:
        file_path: Path to file
        
    Returns:
        File size in MB
    """
    try:
        size_bytes = os.path.getsize(file_path)
        return size_bytes / (1024 * 1024)
    except OSError:
        return 0.0


def is_file_size_valid(file_path: str, max_size_mb: float = None) -> bool:
    """
    Check if file size is within limits.
    
    Args:
        file_path: Path to file
        max_size_mb: Maximum size in MB
        
    Returns:
        True if file size is valid, False otherwise
    """
    if max_size_mb is None:
        max_size_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
    
    file_size_mb = get_file_size_mb(file_path)
    return file_size_mb <= max_size_mb


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove or replace dangerous characters
    dangerous_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    sanitized = filename
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Limit length
    if len(sanitized) > 255:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:255-len(ext)] + ext
    
    return sanitized


def generate_unique_filename(original_filename: str, directory: str = None) -> str:
    """
    Generate unique filename to avoid conflicts.
    
    Args:
        original_filename: Original filename
        directory: Directory to check for conflicts
        
    Returns:
        Unique filename
    """
    if directory is None:
        directory = settings.UPLOAD_DIR
    
    # Ensure directory exists
    ensure_directory_exists(directory)
    
    # Get file parts
    name, ext = os.path.splitext(original_filename)
    sanitized_name = sanitize_filename(name)
    
    # Generate unique filename
    counter = 1
    unique_filename = f"{sanitized_name}{ext}"
    file_path = os.path.join(directory, unique_filename)
    
    while os.path.exists(file_path):
        unique_filename = f"{sanitized_name}_{counter}{ext}"
        file_path = os.path.join(directory, unique_filename)
        counter += 1
    
    return unique_filename


def format_currency(amount: float, currency: str = "USD") -> str:
    """
    Format currency amount.
    
    Args:
        amount: Amount to format
        currency: Currency code
        
    Returns:
        Formatted currency string
    """
    return f"{currency} {amount:,.2f}"


def format_percentage(value: float, decimals: int = 2) -> str:
    """
    Format percentage value.
    
    Args:
        value: Percentage value (0-100)
        decimals: Number of decimal places
        
    Returns:
        Formatted percentage string
    """
    return f"{value:.{decimals}f}%"


def calculate_pagination_info(page: int, limit: int, total: int) -> Dict[str, Any]:
    """
    Calculate pagination information.
    
    Args:
        page: Current page number
        limit: Items per page
        total: Total number of items
        
    Returns:
        Pagination information dictionary
    """
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    has_next = page < total_pages
    has_prev = page > 1
    
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev,
        "next_page": page + 1 if has_next else None,
        "prev_page": page - 1 if has_prev else None
    }


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """
    Mask sensitive data for logging.
    
    Args:
        data: Data to mask
        visible_chars: Number of characters to show at the end
        
    Returns:
        Masked data string
    """
    if len(data) <= visible_chars:
        return "*" * len(data)
    
    return "*" * (len(data) - visible_chars) + data[-visible_chars:]


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email is valid, False otherwise
    """
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if phone is valid, False otherwise
    """
    import re
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    # Check if it's a valid length (7-15 digits)
    return 7 <= len(digits_only) <= 15


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to specified length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """
    Split list into chunks of specified size.
    
    Args:
        lst: List to chunk
        chunk_size: Size of each chunk
        
    Returns:
        List of chunks
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def deep_merge_dicts(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deep merge two dictionaries.
    
    Args:
        dict1: First dictionary
        dict2: Second dictionary
        
    Returns:
        Merged dictionary
    """
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    
    return result
