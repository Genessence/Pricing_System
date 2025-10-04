"""
Centralized password hashing and verification utilities.
"""

from passlib.context import CryptContext

# Password hashing context - use bcrypt_sha256 to avoid 72-byte limit
pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto",
    bcrypt__max_length=None
)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt_sha256 scheme.
    This automatically handles SHA256 → bcrypt and avoids the 72-byte limit.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    Supports both bcrypt_sha256 and legacy bcrypt hashes.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)
