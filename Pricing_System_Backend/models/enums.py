"""
Database enums for the pricing system.
Defines all enum types used in the database schema.
"""

from enum import Enum


class CommodityTypes(str, Enum):
    """Commodity types for RFQ classification."""
    INDENT = "INDENT"
    SERVICE = "SERVICE"
    TRANSPORT = "TRANSPORT"


class RFQStatus(str, Enum):
    """RFQ status values."""
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    SENT_TO_VENDORS = "SENT_TO_VENDORS"
    QUOTATIONS_RECEIVED = "QUOTATIONS_RECEIVED"
    EVALUATION = "EVALUATION"
    AWARDED = "AWARDED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class UserRoles(str, Enum):
    """User role types."""
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    APPROVER = "APPROVER"
    USER = "USER"
    VENDOR = "VENDOR"


class SupplierStatus(str, Enum):
    """Supplier status values."""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    BLACKLISTED = "BLACKLISTED"


class AttachmentType(str, Enum):
    """Attachment type values."""
    RFQ_DOCUMENT = "RFQ_DOCUMENT"
    QUOTATION = "QUOTATION"
    TECHNICAL_SPECIFICATION = "TECHNICAL_SPECIFICATION"
    DRAWING = "DRAWING"
    CERTIFICATE = "CERTIFICATE"
    OTHER = "OTHER"
