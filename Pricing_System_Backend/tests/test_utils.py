"""
Unit tests for utility functions.
"""

import pytest
import tempfile
import os
from datetime import datetime, timezone
from uuid import uuid4

from utils.helpers import (
    generate_uuid, generate_short_id, generate_hash, get_current_timestamp,
    format_timestamp, parse_timestamp, ensure_directory_exists,
    get_file_extension, is_allowed_file_type, get_file_size_mb,
    is_file_size_valid, sanitize_filename, generate_unique_filename,
    format_currency, format_percentage, calculate_pagination_info,
    mask_sensitive_data, validate_email, validate_phone, truncate_text,
    chunk_list, deep_merge_dicts
)
from utils.validators import (
    validate_required, validate_string_length, validate_email as validate_email_format,
    validate_phone as validate_phone_format, validate_positive_number,
    validate_non_negative_number, validate_decimal, validate_enum_value,
    validate_commodity_type, validate_rfq_status, validate_user_role,
    validate_supplier_status, validate_attachment_type, validate_date_range,
    validate_future_date, validate_past_date, validate_uuid_format,
    validate_password_strength, validate_file_extension, validate_file_size,
    validate_rating, validate_percentage, validate_business_rules,
    validate_data_integrity, ValidationError
)
from models.enums import COMMODITY_TYPES, RFQ_STATUS, USER_ROLES, SUPPLIER_STATUS, ATTACHMENT_TYPE


class TestHelperFunctions:
    """Test cases for helper utility functions."""
    
    def test_generate_uuid(self):
        """Test UUID generation."""
        uuid_str = generate_uuid()
        
        assert isinstance(uuid_str, str)
        assert len(uuid_str) == 36  # Standard UUID length
        assert uuid_str.count('-') == 4  # Standard UUID format
    
    def test_generate_short_id(self):
        """Test short ID generation."""
        short_id = generate_short_id(8)
        
        assert isinstance(short_id, str)
        assert len(short_id) == 8
    
    def test_generate_short_id_different_lengths(self):
        """Test short ID generation with different lengths."""
        for length in [4, 8, 12, 16]:
            short_id = generate_short_id(length)
            assert len(short_id) == length
    
    def test_generate_hash(self):
        """Test hash generation."""
        data = "test data"
        hash_value = generate_hash(data)
        
        assert isinstance(hash_value, str)
        assert len(hash_value) == 64  # SHA256 hash length
    
    def test_generate_hash_different_algorithms(self):
        """Test hash generation with different algorithms."""
        data = "test data"
        
        sha256_hash = generate_hash(data, "sha256")
        sha1_hash = generate_hash(data, "sha1")
        md5_hash = generate_hash(data, "md5")
        
        assert sha256_hash != sha1_hash
        assert sha1_hash != md5_hash
        assert sha256_hash != md5_hash
    
    def test_get_current_timestamp(self):
        """Test current timestamp generation."""
        timestamp = get_current_timestamp()
        
        assert isinstance(timestamp, datetime)
        assert timestamp.tzinfo is not None  # Should be timezone-aware
    
    def test_format_timestamp(self):
        """Test timestamp formatting."""
        timestamp = datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        formatted = format_timestamp(timestamp)
        
        assert formatted == "2024-01-01 12:00:00"
    
    def test_format_timestamp_custom_format(self):
        """Test timestamp formatting with custom format."""
        timestamp = datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        formatted = format_timestamp(timestamp, "%Y-%m-%d")
        
        assert formatted == "2024-01-01"
    
    def test_parse_timestamp(self):
        """Test timestamp parsing."""
        timestamp_str = "2024-01-01 12:00:00"
        parsed = parse_timestamp(timestamp_str)
        
        assert parsed is not None
        assert parsed.year == 2024
        assert parsed.month == 1
        assert parsed.day == 1
        assert parsed.hour == 12
    
    def test_parse_timestamp_invalid(self):
        """Test timestamp parsing with invalid format."""
        invalid_timestamp = "invalid timestamp"
        parsed = parse_timestamp(invalid_timestamp)
        
        assert parsed is None
    
    def test_ensure_directory_exists(self):
        """Test directory creation."""
        with tempfile.TemporaryDirectory() as temp_dir:
            new_dir = os.path.join(temp_dir, "test_dir")
            
            result = ensure_directory_exists(new_dir)
            
            assert result is True
            assert os.path.exists(new_dir)
            assert os.path.isdir(new_dir)
    
    def test_ensure_directory_exists_already_exists(self):
        """Test directory creation when directory already exists."""
        with tempfile.TemporaryDirectory() as temp_dir:
            result = ensure_directory_exists(temp_dir)
            
            assert result is True
            assert os.path.exists(temp_dir)
    
    def test_get_file_extension(self):
        """Test file extension extraction."""
        assert get_file_extension("test.txt") == "txt"
        assert get_file_extension("document.pdf") == "pdf"
        assert get_file_extension("image.PNG") == "png"  # Should be lowercase
        assert get_file_extension("file") == ""
        assert get_file_extension("file.") == ""
    
    def test_is_allowed_file_type(self):
        """Test file type validation."""
        allowed_extensions = ["txt", "pdf", "doc"]
        
        assert is_allowed_file_type("test.txt", allowed_extensions) is True
        assert is_allowed_file_type("document.pdf", allowed_extensions) is True
        assert is_allowed_file_type("image.jpg", allowed_extensions) is False
        assert is_allowed_file_type("file", allowed_extensions) is False
    
    def test_get_file_size_mb(self, temp_file):
        """Test file size calculation in MB."""
        size_mb = get_file_size_mb(temp_file)
        
        assert isinstance(size_mb, float)
        assert size_mb > 0
    
    def test_get_file_size_mb_nonexistent(self):
        """Test file size calculation for non-existent file."""
        size_mb = get_file_size_mb("nonexistent_file.txt")
        
        assert size_mb == 0.0
    
    def test_is_file_size_valid(self, temp_file):
        """Test file size validation."""
        max_size_mb = 1.0
        
        assert is_file_size_valid(temp_file, max_size_mb) is True
    
    def test_is_file_size_valid_too_large(self, temp_file):
        """Test file size validation for too large file."""
        max_size_mb = 0.001  # Very small limit
        
        assert is_file_size_valid(temp_file, max_size_mb) is False
    
    def test_sanitize_filename(self):
        """Test filename sanitization."""
        dangerous_filename = "test<>:\"|?*file.txt"
        sanitized = sanitize_filename(dangerous_filename)
        
        assert ">" not in sanitized
        assert "<" not in sanitized
        assert ":" not in sanitized
        assert "\"" not in sanitized
        assert "|" not in sanitized
        assert "?" not in sanitized
        assert "*" not in sanitized
    
    def test_sanitize_filename_length_limit(self):
        """Test filename sanitization with length limit."""
        long_filename = "a" * 300 + ".txt"
        sanitized = sanitize_filename(long_filename)
        
        assert len(sanitized) <= 255
    
    def test_generate_unique_filename(self):
        """Test unique filename generation."""
        with tempfile.TemporaryDirectory() as temp_dir:
            original_filename = "test.txt"
            unique_filename = generate_unique_filename(original_filename, temp_dir)
            
            assert unique_filename == original_filename  # Should be same if no conflict
            
            # Create a file with the same name
            with open(os.path.join(temp_dir, original_filename), 'w') as f:
                f.write("test")
            
            # Generate unique filename again
            unique_filename = generate_unique_filename(original_filename, temp_dir)
            
            assert unique_filename != original_filename
            assert unique_filename.startswith("test_")
            assert unique_filename.endswith(".txt")
    
    def test_format_currency(self):
        """Test currency formatting."""
        assert format_currency(1000.50) == "USD 1,000.50"
        assert format_currency(1000.50, "EUR") == "EUR 1,000.50"
        assert format_currency(0) == "USD 0.00"
    
    def test_format_percentage(self):
        """Test percentage formatting."""
        assert format_percentage(50.5) == "50.50%"
        assert format_percentage(50.5, 1) == "50.5%"
        assert format_percentage(100) == "100.00%"
    
    def test_calculate_pagination_info(self):
        """Test pagination information calculation."""
        info = calculate_pagination_info(page=2, limit=10, total=25)
        
        assert info["page"] == 2
        assert info["limit"] == 10
        assert info["total"] == 25
        assert info["total_pages"] == 3
        assert info["has_next"] is True
        assert info["has_prev"] is True
        assert info["next_page"] == 3
        assert info["prev_page"] == 1
    
    def test_calculate_pagination_info_first_page(self):
        """Test pagination information for first page."""
        info = calculate_pagination_info(page=1, limit=10, total=25)
        
        assert info["has_prev"] is False
        assert info["prev_page"] is None
        assert info["has_next"] is True
        assert info["next_page"] == 2
    
    def test_calculate_pagination_info_last_page(self):
        """Test pagination information for last page."""
        info = calculate_pagination_info(page=3, limit=10, total=25)
        
        assert info["has_next"] is False
        assert info["next_page"] is None
        assert info["has_prev"] is True
        assert info["prev_page"] == 2
    
    def test_mask_sensitive_data(self):
        """Test sensitive data masking."""
        assert mask_sensitive_data("1234567890") == "******7890"
        assert mask_sensitive_data("1234") == "****"
        assert mask_sensitive_data("12") == "**"
        assert mask_sensitive_data("1") == "*"
    
    def test_validate_email(self):
        """Test email validation."""
        assert validate_email("test@example.com") is True
        assert validate_email("user.name@domain.co.uk") is True
        assert validate_email("invalid-email") is False
        assert validate_email("@domain.com") is False
        assert validate_email("user@") is False
    
    def test_validate_phone(self):
        """Test phone validation."""
        assert validate_phone("1234567890") is True
        assert validate_phone("+1-234-567-8900") is True
        assert validate_phone("(123) 456-7890") is True
        assert validate_phone("123") is False  # Too short
        assert validate_phone("1234567890123456") is False  # Too long
    
    def test_truncate_text(self):
        """Test text truncation."""
        text = "This is a very long text that should be truncated"
        
        assert truncate_text(text, 20) == "This is a very long..."
        assert truncate_text(text, 20, "---") == "This is a very long---"
        assert truncate_text("Short", 20) == "Short"  # Should not truncate
    
    def test_chunk_list(self):
        """Test list chunking."""
        lst = list(range(10))
        chunks = chunk_list(lst, 3)
        
        assert len(chunks) == 4
        assert chunks[0] == [0, 1, 2]
        assert chunks[1] == [3, 4, 5]
        assert chunks[2] == [6, 7, 8]
        assert chunks[3] == [9]
    
    def test_deep_merge_dicts(self):
        """Test deep dictionary merging."""
        dict1 = {"a": 1, "b": {"c": 2, "d": 3}}
        dict2 = {"b": {"c": 4, "e": 5}, "f": 6}
        
        merged = deep_merge_dicts(dict1, dict2)
        
        assert merged["a"] == 1
        assert merged["b"]["c"] == 4  # Should be overwritten
        assert merged["b"]["d"] == 3  # Should be preserved
        assert merged["b"]["e"] == 5  # Should be added
        assert merged["f"] == 6  # Should be added


class TestValidatorFunctions:
    """Test cases for validator utility functions."""
    
    def test_validate_required_success(self):
        """Test successful required field validation."""
        validate_required("test", "field_name")  # Should not raise
    
    def test_validate_required_failure(self):
        """Test required field validation failure."""
        with pytest.raises(ValidationError):
            validate_required(None, "field_name")
        
        with pytest.raises(ValidationError):
            validate_required("", "field_name")
        
        with pytest.raises(ValidationError):
            validate_required("   ", "field_name")
    
    def test_validate_string_length_success(self):
        """Test successful string length validation."""
        validate_string_length("test", "field_name", 1, 10)  # Should not raise
    
    def test_validate_string_length_failure(self):
        """Test string length validation failure."""
        with pytest.raises(ValidationError):
            validate_string_length("", "field_name", 1, 10)
        
        with pytest.raises(ValidationError):
            validate_string_length("a" * 20, "field_name", 1, 10)
        
        with pytest.raises(ValidationError):
            validate_string_length(123, "field_name", 1, 10)  # Not a string
    
    def test_validate_email_format_success(self):
        """Test successful email format validation."""
        validate_email_format("test@example.com")  # Should not raise
        validate_email_format("user.name@domain.co.uk")  # Should not raise
    
    def test_validate_email_format_failure(self):
        """Test email format validation failure."""
        with pytest.raises(ValidationError):
            validate_email_format("invalid-email")
        
        with pytest.raises(ValidationError):
            validate_email_format("@domain.com")
        
        with pytest.raises(ValidationError):
            validate_email_format("user@")
    
    def test_validate_phone_format_success(self):
        """Test successful phone format validation."""
        validate_phone_format("1234567890")  # Should not raise
        validate_phone_format("")  # Empty phone should be allowed (optional)
    
    def test_validate_phone_format_failure(self):
        """Test phone format validation failure."""
        with pytest.raises(ValidationError):
            validate_phone_format("123")  # Too short
        
        with pytest.raises(ValidationError):
            validate_phone_format("1234567890123456")  # Too long
    
    def test_validate_positive_number_success(self):
        """Test successful positive number validation."""
        validate_positive_number(10, "field_name")  # Should not raise
        validate_positive_number(0.5, "field_name")  # Should not raise
    
    def test_validate_positive_number_failure(self):
        """Test positive number validation failure."""
        with pytest.raises(ValidationError):
            validate_positive_number(0, "field_name")
        
        with pytest.raises(ValidationError):
            validate_positive_number(-5, "field_name")
        
        with pytest.raises(ValidationError):
            validate_positive_number("invalid", "field_name")
    
    def test_validate_non_negative_number_success(self):
        """Test successful non-negative number validation."""
        validate_non_negative_number(0, "field_name")  # Should not raise
        validate_non_negative_number(10, "field_name")  # Should not raise
    
    def test_validate_non_negative_number_failure(self):
        """Test non-negative number validation failure."""
        with pytest.raises(ValidationError):
            validate_non_negative_number(-5, "field_name")
    
    def test_validate_decimal_success(self):
        """Test successful decimal validation."""
        validate_decimal(10.50, "field_name", 2)  # Should not raise
        validate_decimal(10, "field_name", 2)  # Should not raise
    
    def test_validate_decimal_failure(self):
        """Test decimal validation failure."""
        with pytest.raises(ValidationError):
            validate_decimal(10.123, "field_name", 2)  # Too many decimal places
        
        with pytest.raises(ValidationError):
            validate_decimal("invalid", "field_name", 2)
    
    def test_validate_enum_value_success(self):
        """Test successful enum value validation."""
        validate_enum_value("INDENT", COMMODITY_TYPES, "field_name")  # Should not raise
    
    def test_validate_enum_value_failure(self):
        """Test enum value validation failure."""
        with pytest.raises(ValidationError):
            validate_enum_value("INVALID", COMMODITY_TYPES, "field_name")
    
    def test_validate_commodity_type_success(self):
        """Test successful commodity type validation."""
        validate_commodity_type("INDENT")  # Should not raise
        validate_commodity_type("SERVICE")  # Should not raise
        validate_commodity_type("TRANSPORT")  # Should not raise
    
    def test_validate_commodity_type_failure(self):
        """Test commodity type validation failure."""
        with pytest.raises(ValidationError):
            validate_commodity_type("INVALID")
    
    def test_validate_rfq_status_success(self):
        """Test successful RFQ status validation."""
        validate_rfq_status("DRAFT")  # Should not raise
        validate_rfq_status("APPROVED")  # Should not raise
        validate_rfq_status("CLOSED")  # Should not raise
    
    def test_validate_rfq_status_failure(self):
        """Test RFQ status validation failure."""
        with pytest.raises(ValidationError):
            validate_rfq_status("INVALID")
    
    def test_validate_user_role_success(self):
        """Test successful user role validation."""
        validate_user_role("ADMIN")  # Should not raise
        validate_user_role("USER")  # Should not raise
        validate_user_role("APPROVER")  # Should not raise
    
    def test_validate_user_role_failure(self):
        """Test user role validation failure."""
        with pytest.raises(ValidationError):
            validate_user_role("INVALID")
    
    def test_validate_supplier_status_success(self):
        """Test successful supplier status validation."""
        validate_supplier_status("ACTIVE")  # Should not raise
        validate_supplier_status("INACTIVE")  # Should not raise
        validate_supplier_status("PENDING")  # Should not raise
    
    def test_validate_supplier_status_failure(self):
        """Test supplier status validation failure."""
        with pytest.raises(ValidationError):
            validate_supplier_status("INVALID")
    
    def test_validate_attachment_type_success(self):
        """Test successful attachment type validation."""
        validate_attachment_type("DOCUMENT")  # Should not raise
        validate_attachment_type("IMAGE")  # Should not raise
        validate_attachment_type("QUOTATION")  # Should not raise
    
    def test_validate_attachment_type_failure(self):
        """Test attachment type validation failure."""
        with pytest.raises(ValidationError):
            validate_attachment_type("INVALID")
    
    def test_validate_date_range_success(self):
        """Test successful date range validation."""
        from datetime import date
        start_date = date(2024, 1, 1)
        end_date = date(2024, 1, 31)
        
        validate_date_range(start_date, end_date)  # Should not raise
    
    def test_validate_date_range_failure(self):
        """Test date range validation failure."""
        from datetime import date
        start_date = date(2024, 1, 31)
        end_date = date(2024, 1, 1)
        
        with pytest.raises(ValidationError):
            validate_date_range(start_date, end_date)
    
    def test_validate_future_date_success(self):
        """Test successful future date validation."""
        from datetime import date, timedelta
        future_date = date.today() + timedelta(days=1)
        
        validate_future_date(future_date, "field_name")  # Should not raise
    
    def test_validate_future_date_failure(self):
        """Test future date validation failure."""
        from datetime import date
        past_date = date.today()
        
        with pytest.raises(ValidationError):
            validate_future_date(past_date, "field_name")
    
    def test_validate_past_date_success(self):
        """Test successful past date validation."""
        from datetime import date, timedelta
        past_date = date.today() - timedelta(days=1)
        
        validate_past_date(past_date, "field_name")  # Should not raise
    
    def test_validate_past_date_failure(self):
        """Test past date validation failure."""
        from datetime import date
        future_date = date.today()
        
        with pytest.raises(ValidationError):
            validate_past_date(future_date, "field_name")
    
    def test_validate_uuid_format_success(self):
        """Test successful UUID format validation."""
        test_uuid = str(uuid4())
        
        validate_uuid_format(test_uuid, "field_name")  # Should not raise
    
    def test_validate_uuid_format_failure(self):
        """Test UUID format validation failure."""
        with pytest.raises(ValidationError):
            validate_uuid_format("invalid-uuid", "field_name")
    
    def test_validate_password_strength_success(self):
        """Test successful password strength validation."""
        validate_password_strength("Password123!")  # Should not raise
    
    def test_validate_password_strength_failure(self):
        """Test password strength validation failure."""
        with pytest.raises(ValidationError):
            validate_password_strength("weak")  # Too short
        
        with pytest.raises(ValidationError):
            validate_password_strength("password")  # No uppercase, numbers, special chars
    
    def test_validate_file_extension_success(self):
        """Test successful file extension validation."""
        validate_file_extension("test.pdf", ["pdf", "doc", "txt"])  # Should not raise
    
    def test_validate_file_extension_failure(self):
        """Test file extension validation failure."""
        with pytest.raises(ValidationError):
            validate_file_extension("test.jpg", ["pdf", "doc", "txt"])
    
    def test_validate_file_size_success(self):
        """Test successful file size validation."""
        validate_file_size(1024, 2048, "field_name")  # Should not raise
    
    def test_validate_file_size_failure(self):
        """Test file size validation failure."""
        with pytest.raises(ValidationError):
            validate_file_size(2048, 1024, "field_name")
    
    def test_validate_rating_success(self):
        """Test successful rating validation."""
        validate_rating(3, "field_name")  # Should not raise
        validate_rating(5, "field_name")  # Should not raise
    
    def test_validate_rating_failure(self):
        """Test rating validation failure."""
        with pytest.raises(ValidationError):
            validate_rating(0, "field_name")
        
        with pytest.raises(ValidationError):
            validate_rating(6, "field_name")
    
    def test_validate_percentage_success(self):
        """Test successful percentage validation."""
        validate_percentage(50, "field_name")  # Should not raise
        validate_percentage(0, "field_name")  # Should not raise
        validate_percentage(100, "field_name")  # Should not raise
    
    def test_validate_percentage_failure(self):
        """Test percentage validation failure."""
        with pytest.raises(ValidationError):
            validate_percentage(-10, "field_name")
        
        with pytest.raises(ValidationError):
            validate_percentage(150, "field_name")
    
    def test_validate_business_rules_success(self):
        """Test successful business rules validation."""
        data = {
            "rfq_data": {
                "status": "APPROVED",
                "approved_by": "user123",
                "total_value": 1000.0
            },
            "vendor_data": {
                "status": "ACTIVE",
                "contact_email": "vendor@example.com"
            },
            "user_data": {
                "role": "ADMIN",
                "site_id": "site123"
            }
        }
        
        validate_business_rules(data)  # Should not raise
    
    def test_validate_business_rules_failure(self):
        """Test business rules validation failure."""
        data = {
            "rfq_data": {
                "status": "APPROVED",
                "approved_by": None,  # Missing approver
                "total_value": 0  # Invalid total value
            }
        }
        
        with pytest.raises(ValidationError):
            validate_business_rules(data)
    
    def test_validate_data_integrity_success(self):
        """Test successful data integrity validation."""
        data = {
            "rfq_id": "rfq123",
            "vendor_ids": ["vendor1", "vendor2"],
            "parent_id": "parent123",
            "id": "child123",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        
        validate_data_integrity(data)  # Should not raise
    
    def test_validate_data_integrity_failure(self):
        """Test data integrity validation failure."""
        data = {
            "rfq_id": "rfq123",
            "vendor_ids": [],  # Empty vendor list
            "parent_id": "child123",
            "id": "child123",  # Circular reference
            "start_date": "2024-01-31",
            "end_date": "2024-01-01"  # Invalid date range
        }
        
        with pytest.raises(ValidationError):
            validate_data_integrity(data)
