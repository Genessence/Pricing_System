"""
Unit tests for SQLAlchemy models.
"""

import pytest
from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from models.users import Users
from models.sites import Sites
from models.vendors import Vendors
from models.general_purchase_rfq import GeneralPurchaseRFQ
from models.indent_items import IndentItems
from models.service_items import ServiceItems
from models.transport_items import TransportItems
from models.attachments import Attachments
from models.rfq_vendors import RFQVendors
from models.enums import CommodityTypes, RFQStatus, UserRoles, SupplierStatus, AttachmentType


class TestSitesModel:
    """Test cases for Sites model."""
    
    def test_create_site(self, db_session):
        """Test creating a site."""
        site = Sites(
            id=uuid4(),
            code="SITE001",
            name="Test Site",
            address="123 Test Street",
            city="Test City",
            state="Test State",
            country="Test Country",
            postal_code="12345",
            contact_person="Test Person",
            contact_email="test@example.com",
            contact_phone="1234567890",
            is_active=True
        )
        
        db_session.add(site)
        db_session.commit()
        db_session.refresh(site)
        
        assert site.id is not None
        assert site.code == "SITE001"
        assert site.name == "Test Site"
        assert site.is_active is True
        assert site.created_at is not None
        assert site.updated_at is not None
    
    def test_site_required_fields(self, db_session):
        """Test that required fields are enforced."""
        site = Sites()
        
        db_session.add(site)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_site_unique_code(self, db_session):
        """Test that site code must be unique."""
        site1 = Sites(
            id=uuid4(),
            code="SITE001",
            name="Site 1"
        )
        
        site2 = Sites(
            id=uuid4(),
            code="SITE001",  # Same code
            name="Site 2"
        )
        
        db_session.add(site1)
        db_session.commit()
        
        db_session.add(site2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestUsersModel:
    """Test cases for Users model."""
    
    def test_create_user(self, db_session, test_site):
        """Test creating a user."""
        user = Users(
            id=uuid4(),
            username="testuser",
            email="test@example.com",
            password_hash="hashedpassword",
            first_name="Test",
            last_name="User",
            role="USER",
            site_id=test_site.id,
            is_active=True
        )
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.role == "USER"
        assert user.site_id == test_site.id
        assert user.is_active is True
    
    def test_user_required_fields(self, db_session):
        """Test that required fields are enforced."""
        user = Users()
        
        db_session.add(user)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_unique_username(self, db_session, test_site):
        """Test that username must be unique."""
        user1 = Users(
            id=uuid4(),
            username="testuser",
            email="test1@example.com",
            password_hash="hash1",
            site_id=test_site.id
        )
        
        user2 = Users(
            id=uuid4(),
            username="testuser",  # Same username
            email="test2@example.com",
            password_hash="hash2",
            site_id=test_site.id
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_unique_email(self, db_session, test_site):
        """Test that email must be unique."""
        user1 = Users(
            id=uuid4(),
            username="user1",
            email="test@example.com",
            password_hash="hash1",
            site_id=test_site.id
        )
        
        user2 = Users(
            id=uuid4(),
            username="user2",
            email="test@example.com",  # Same email
            password_hash="hash2",
            site_id=test_site.id
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestVendorsModel:
    """Test cases for Vendors model."""
    
    def test_create_vendor(self, db_session):
        """Test creating a vendor."""
        vendor = Vendors(
            id=uuid4(),
            code="VENDOR001",
            name="Test Vendor",
            contact_person="Vendor Person",
            contact_email="vendor@example.com",
            contact_phone="1234567890",
            providing_commodity_type="INDENT",
            status="ACTIVE",
            rating=4,
            is_active=True
        )
        
        db_session.add(vendor)
        db_session.commit()
        db_session.refresh(vendor)
        
        assert vendor.id is not None
        assert vendor.code == "VENDOR001"
        assert vendor.name == "Test Vendor"
        assert vendor.providing_commodity_type == "INDENT"
        assert vendor.status == "ACTIVE"
        assert vendor.rating == 4
    
    def test_vendor_required_fields(self, db_session):
        """Test that required fields are enforced."""
        vendor = Vendors()
        
        db_session.add(vendor)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_vendor_unique_code(self, db_session):
        """Test that vendor code must be unique."""
        vendor1 = Vendors(
            id=uuid4(),
            code="VENDOR001",
            name="Vendor 1"
        )
        
        vendor2 = Vendors(
            id=uuid4(),
            code="VENDOR001",  # Same code
            name="Vendor 2"
        )
        
        db_session.add(vendor1)
        db_session.commit()
        
        db_session.add(vendor2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestGeneralPurchaseRFQModel:
    """Test cases for GeneralPurchaseRFQ model."""
    
    def test_create_rfq(self, db_session, test_user, test_site):
        """Test creating an RFQ."""
        rfq = GeneralPurchaseRFQ(
            id=uuid4(),
            rfq_number="RFQ-2024-001",
            title="Test RFQ",
            description="Test RFQ Description",
            commodity_type="INDENT",
            status="DRAFT",
            site_code=test_site.code,
            created_by=test_user.id,
            total_value=1000.00
        )
        
        db_session.add(rfq)
        db_session.commit()
        db_session.refresh(rfq)
        
        assert rfq.id is not None
        assert rfq.rfq_number == "RFQ-2024-001"
        assert rfq.title == "Test RFQ"
        assert rfq.commodity_type == "INDENT"
        assert rfq.status == "DRAFT"
        assert rfq.total_value == 1000.00
    
    def test_rfq_required_fields(self, db_session):
        """Test that required fields are enforced."""
        rfq = GeneralPurchaseRFQ()
        
        db_session.add(rfq)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_rfq_unique_number(self, db_session, test_user, test_site):
        """Test that RFQ number must be unique."""
        rfq1 = GeneralPurchaseRFQ(
            id=uuid4(),
            rfq_number="RFQ-2024-001",
            title="RFQ 1",
            commodity_type="INDENT",
            site_code=test_site.code,
            created_by=test_user.id
        )
        
        rfq2 = GeneralPurchaseRFQ(
            id=uuid4(),
            rfq_number="RFQ-2024-001",  # Same number
            title="RFQ 2",
            commodity_type="INDENT",
            site_code=test_site.code,
            created_by=test_user.id
        )
        
        db_session.add(rfq1)
        db_session.commit()
        
        db_session.add(rfq2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestIndentItemsModel:
    """Test cases for IndentItems model."""
    
    def test_create_indent_item(self, db_session):
        """Test creating an indent item."""
        item = IndentItems(
            id=uuid4(),
            item_code="ITEM001",
            description="Test Item",
            unit="PCS",
            quantity=10,
            unit_price=100.00,
            total_price=1000.00,
            is_active=True
        )
        
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)
        
        assert item.id is not None
        assert item.item_code == "ITEM001"
        assert item.description == "Test Item"
        assert item.quantity == 10
        assert item.unit_price == 100.00
        assert item.total_price == 1000.00
    
    def test_indent_item_required_fields(self, db_session):
        """Test that required fields are enforced."""
        item = IndentItems()
        
        db_session.add(item)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestServiceItemsModel:
    """Test cases for ServiceItems model."""
    
    def test_create_service_item(self, db_session, test_rfq):
        """Test creating a service item."""
        item = ServiceItems(
            id=uuid4(),
            rfq_id=test_rfq.id,
            description="Test Service",
            unit="HOURS",
            quantity=8,
            unit_price=50.00,
            total_price=400.00
        )
        
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)
        
        assert item.id is not None
        assert item.rfq_id == test_rfq.id
        assert item.description == "Test Service"
        assert item.quantity == 8
        assert item.unit_price == 50.00
        assert item.total_price == 400.00


class TestTransportItemsModel:
    """Test cases for TransportItems model."""
    
    def test_create_transport_item(self, db_session, test_rfq):
        """Test creating a transport item."""
        item = TransportItems(
            id=uuid4(),
            rfq_id=test_rfq.id,
            description="Test Transport",
            from_location="City A",
            to_location="City B",
            distance=100,
            unit_price=2.00,
            total_price=200.00
        )
        
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)
        
        assert item.id is not None
        assert item.rfq_id == test_rfq.id
        assert item.description == "Test Transport"
        assert item.from_location == "City A"
        assert item.to_location == "City B"
        assert item.distance == 100


class TestAttachmentsModel:
    """Test cases for Attachments model."""
    
    def test_create_attachment(self, db_session, test_rfq):
        """Test creating an attachment."""
        attachment = Attachments(
            id=uuid4(),
            rfq_id=test_rfq.id,
            filename="test.pdf",
            file_path="/uploads/test.pdf",
            file_size=1024,
            content_type="application/pdf",
            attachment_type="DOCUMENT"
        )
        
        db_session.add(attachment)
        db_session.commit()
        db_session.refresh(attachment)
        
        assert attachment.id is not None
        assert attachment.rfq_id == test_rfq.id
        assert attachment.filename == "test.pdf"
        assert attachment.file_size == 1024
        assert attachment.content_type == "application/pdf"
        assert attachment.attachment_type == "DOCUMENT"


class TestRFQVendorsModel:
    """Test cases for RFQVendors model."""
    
    def test_create_rfq_vendors(self, db_session, test_rfq, test_vendor):
        """Test creating RFQ vendor association."""
        rfq_vendors = RFQVendors(
            id=uuid4(),
            rfq_id=test_rfq.id,
            vendors_ids=[test_vendor.id]
        )
        
        db_session.add(rfq_vendors)
        db_session.commit()
        db_session.refresh(rfq_vendors)
        
        assert rfq_vendors.id is not None
        assert rfq_vendors.rfq_id == test_rfq.id
        assert test_vendor.id in rfq_vendors.vendors_ids


class TestEnums:
    """Test cases for enum classes."""
    
    def test_commodity_types_enum(self):
        """Test CommodityTypes enum values."""
        assert CommodityTypes.INDENT.value == "INDENT"
        assert CommodityTypes.SERVICE.value == "SERVICE"
        assert CommodityTypes.TRANSPORT.value == "TRANSPORT"
    
    def test_rfq_status_enum(self):
        """Test RFQStatus enum values."""
        assert RFQStatus.DRAFT.value == "DRAFT"
        assert RFQStatus.APPROVED.value == "APPROVED"
        assert RFQStatus.CLOSED.value == "CLOSED"
    
    def test_user_roles_enum(self):
        """Test UserRoles enum values."""
        assert UserRoles.ADMIN.value == "ADMIN"
        assert UserRoles.USER.value == "USER"
        assert UserRoles.APPROVER.value == "APPROVER"
    
    def test_supplier_status_enum(self):
        """Test SupplierStatus enum values."""
        assert SupplierStatus.ACTIVE.value == "ACTIVE"
        assert SupplierStatus.INACTIVE.value == "INACTIVE"
        assert SupplierStatus.SUSPENDED.value == "SUSPENDED"
    
    def test_attachment_type_enum(self):
        """Test AttachmentType enum values."""
        assert AttachmentType.RFQ_DOCUMENT.value == "RFQ_DOCUMENT"
        assert AttachmentType.QUOTATION.value == "QUOTATION"
        assert AttachmentType.TECHNICAL_SPECIFICATION.value == "TECHNICAL_SPECIFICATION"
