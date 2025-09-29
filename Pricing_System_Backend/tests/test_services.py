"""
Unit tests for service layer.
"""

import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

from services.sites import SitesService
from services.users import UsersService
from services.vendors import VendorsService
from services.general_purchase_rfq import GeneralPurchaseRFQService
from services.attachments import AttachmentsService
from schemas.sites import SitesCreate, SitesUpdate
from schemas.users import UsersCreate, UsersUpdate, UsersLogin
from schemas.vendors import VendorsCreate, VendorsUpdate
from schemas.general_purchase_rfq import GeneralPurchaseRFQCreate, GeneralPurchaseRFQUpdate
from schemas.attachments import AttachmentsCreate, AttachmentsUpload
from utils.error_handler import NotFoundError, ValidationError


class TestSitesService:
    """Test cases for SitesService."""
    
    def test_create_site(self, db_session, sample_site_data):
        """Test creating a site."""
        service = SitesService()
        site_data = SitesCreate(**sample_site_data)
        
        site = service.create_site(db_session, site_data)
        
        assert site.id is not None
        assert site.code == sample_site_data["code"]
        assert site.name == sample_site_data["name"]
        assert site.is_active is True
    
    def test_get_site(self, db_session, test_site):
        """Test getting a site by ID."""
        service = SitesService()
        
        site = service.get(db_session, test_site.id)
        
        assert site is not None
        assert site.id == test_site.id
        assert site.code == test_site.code
    
    def test_get_site_not_found(self, db_session):
        """Test getting a non-existent site."""
        service = SitesService()
        
        site = service.get(db_session, "non-existent-id")
        
        assert site is None
    
    def test_get_site_by_code(self, db_session, test_site):
        """Test getting a site by code."""
        service = SitesService()
        
        site = service.get_site_by_code(db_session, test_site.code)
        
        assert site is not None
        assert site.code == test_site.code
    
    def test_update_site(self, db_session, test_site):
        """Test updating a site."""
        service = SitesService()
        update_data = SitesUpdate(name="Updated Site Name")
        
        updated_site = service.update_site(db_session, test_site.id, update_data)
        
        assert updated_site is not None
        assert updated_site.name == "Updated Site Name"
        assert updated_site.id == test_site.id
    
    def test_get_active_sites(self, db_session, test_site):
        """Test getting active sites."""
        service = SitesService()
        
        active_sites = service.get_active_sites(db_session)
        
        assert len(active_sites) >= 1
        assert all(site.is_active for site in active_sites)
    
    def test_delete_site(self, db_session, test_site):
        """Test deleting a site."""
        service = SitesService()
        
        result = service.delete(db_session, test_site.id)
        
        assert result is True
        
        # Verify site is deleted
        deleted_site = service.get(db_session, test_site.id)
        assert deleted_site is None


class TestUsersService:
    """Test cases for UsersService."""
    
    def test_create_user(self, db_session, test_site, sample_user_data):
        """Test creating a user."""
        service = UsersService()
        user_data = UsersCreate(**sample_user_data)
        user_data.site_id = test_site.id
        
        user = service.create_user(db_session, user_data)
        
        assert user.id is not None
        assert user.username == sample_user_data["username"]
        assert user.email == sample_user_data["email"]
        assert user.role == sample_user_data["role"]
        assert user.site_id == test_site.id
    
    def test_get_user(self, db_session, test_user):
        """Test getting a user by ID."""
        service = UsersService()
        
        user = service.get(db_session, test_user.id)
        
        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username
    
    def test_authenticate_user(self, db_session, test_user):
        """Test user authentication."""
        service = UsersService()
        
        authenticated_user = service.authenticate_user(
            db_session, 
            test_user.username, 
            "testpassword"
        )
        
        assert authenticated_user is not None
        assert authenticated_user.id == test_user.id
    
    def test_authenticate_user_invalid_credentials(self, db_session, test_user):
        """Test authentication with invalid credentials."""
        service = UsersService()
        
        authenticated_user = service.authenticate_user(
            db_session, 
            test_user.username, 
            "wrongpassword"
        )
        
        assert authenticated_user is None
    
    def test_get_users_by_site(self, db_session, test_site, test_user):
        """Test getting users by site."""
        service = UsersService()
        
        users = service.get_users_by_site(db_session, test_site.id)
        
        assert len(users) >= 1
        assert all(user.site_id == test_site.id for user in users)
    
    def test_get_active_users(self, db_session, test_user):
        """Test getting active users."""
        service = UsersService()
        
        active_users = service.get_active_users(db_session)
        
        assert len(active_users) >= 1
        assert all(user.is_active for user in active_users)
    
    def test_update_user(self, db_session, test_user):
        """Test updating a user."""
        service = UsersService()
        update_data = UsersUpdate(first_name="Updated Name")
        
        updated_user = service.update_user(db_session, test_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.first_name == "Updated Name"
        assert updated_user.id == test_user.id
    
    def test_delete_user(self, db_session, test_user):
        """Test deleting a user."""
        service = UsersService()
        
        result = service.delete(db_session, test_user.id)
        
        assert result is True
        
        # Verify user is deleted
        deleted_user = service.get(db_session, test_user.id)
        assert deleted_user is None


class TestVendorsService:
    """Test cases for VendorsService."""
    
    def test_create_vendor(self, db_session, sample_vendor_data):
        """Test creating a vendor."""
        service = VendorsService()
        vendor_data = VendorsCreate(**sample_vendor_data)
        
        vendor = service.create_vendor(db_session, vendor_data)
        
        assert vendor.id is not None
        assert vendor.code == sample_vendor_data["code"]
        assert vendor.name == sample_vendor_data["name"]
        assert vendor.providing_commodity_type == sample_vendor_data["providing_commodity_type"]
    
    def test_get_vendor(self, db_session, test_vendor):
        """Test getting a vendor by ID."""
        service = VendorsService()
        
        vendor = service.get(db_session, test_vendor.id)
        
        assert vendor is not None
        assert vendor.id == test_vendor.id
        assert vendor.code == test_vendor.code
    
    def test_get_vendor_by_code(self, db_session, test_vendor):
        """Test getting a vendor by code."""
        service = VendorsService()
        
        vendor = service.get_vendor_by_code(db_session, test_vendor.code)
        
        assert vendor is not None
        assert vendor.code == test_vendor.code
    
    def test_get_vendors_by_commodity_type(self, db_session, test_vendor):
        """Test getting vendors by commodity type."""
        service = VendorsService()
        
        vendors = service.get_vendors_by_commodity_type(
            db_session, 
            test_vendor.providing_commodity_type
        )
        
        assert len(vendors) >= 1
        assert all(vendor.providing_commodity_type == test_vendor.providing_commodity_type 
                  for vendor in vendors)
    
    def test_search_vendors(self, db_session, test_vendor):
        """Test searching vendors."""
        service = VendorsService()
        
        vendors = service.search_vendors(db_session, test_vendor.name)
        
        assert len(vendors) >= 1
        assert any(test_vendor.name in vendor.name for vendor in vendors)
    
    def test_get_active_vendors(self, db_session, test_vendor):
        """Test getting active vendors."""
        service = VendorsService()
        
        active_vendors = service.get_active_vendors(db_session)
        
        assert len(active_vendors) >= 1
        assert all(vendor.is_active for vendor in active_vendors)
    
    def test_update_vendor(self, db_session, test_vendor):
        """Test updating a vendor."""
        service = VendorsService()
        update_data = VendorsUpdate(name="Updated Vendor Name")
        
        updated_vendor = service.update_vendor(db_session, test_vendor.id, update_data)
        
        assert updated_vendor is not None
        assert updated_vendor.name == "Updated Vendor Name"
        assert updated_vendor.id == test_vendor.id
    
    def test_update_vendor_rating(self, db_session, test_vendor):
        """Test updating vendor rating."""
        service = VendorsService()
        new_rating = 5
        
        updated_vendor = service.update_vendor_rating(db_session, test_vendor.id, new_rating)
        
        assert updated_vendor is not None
        assert updated_vendor.rating == new_rating
    
    def test_delete_vendor(self, db_session, test_vendor):
        """Test deleting a vendor."""
        service = VendorsService()
        
        result = service.delete(db_session, test_vendor.id)
        
        assert result is True
        
        # Verify vendor is deleted
        deleted_vendor = service.get(db_session, test_vendor.id)
        assert deleted_vendor is None


class TestGeneralPurchaseRFQService:
    """Test cases for GeneralPurchaseRFQService."""
    
    def test_create_rfq(self, db_session, test_user, sample_rfq_data):
        """Test creating an RFQ."""
        service = GeneralPurchaseRFQService()
        rfq_data = GeneralPurchaseRFQCreate(**sample_rfq_data)
        
        rfq = service.create_rfq(db_session, rfq_data, test_user.id)
        
        assert rfq.id is not None
        assert rfq.title == sample_rfq_data["title"]
        assert rfq.commodity_type == sample_rfq_data["commodity_type"]
        assert rfq.created_by == test_user.id
    
    def test_get_rfq(self, db_session, test_rfq):
        """Test getting an RFQ by ID."""
        service = GeneralPurchaseRFQService()
        
        rfq = service.get(db_session, test_rfq.id)
        
        assert rfq is not None
        assert rfq.id == test_rfq.id
        assert rfq.rfq_number == test_rfq.rfq_number
    
    def test_get_rfq_by_number(self, db_session, test_rfq):
        """Test getting an RFQ by number."""
        service = GeneralPurchaseRFQService()
        
        rfq = service.get_rfq_by_number(db_session, test_rfq.rfq_number)
        
        assert rfq is not None
        assert rfq.rfq_number == test_rfq.rfq_number
    
    def test_get_rfqs_by_status(self, db_session, test_rfq):
        """Test getting RFQs by status."""
        service = GeneralPurchaseRFQService()
        
        rfqs = service.get_rfqs_by_status(db_session, test_rfq.status)
        
        assert len(rfqs) >= 1
        assert all(rfq.status == test_rfq.status for rfq in rfqs)
    
    def test_get_rfqs_by_creator(self, db_session, test_rfq):
        """Test getting RFQs by creator."""
        service = GeneralPurchaseRFQService()
        
        rfqs = service.get_rfqs_by_creator(db_session, test_rfq.created_by)
        
        assert len(rfqs) >= 1
        assert all(rfq.created_by == test_rfq.created_by for rfq in rfqs)
    
    def test_get_rfqs_by_site(self, db_session, test_rfq):
        """Test getting RFQs by site."""
        service = GeneralPurchaseRFQService()
        
        rfqs = service.get_rfqs_by_site(db_session, test_rfq.site_code)
        
        assert len(rfqs) >= 1
        assert all(rfq.site_code == test_rfq.site_code for rfq in rfqs)
    
    def test_update_rfq(self, db_session, test_rfq):
        """Test updating an RFQ."""
        service = GeneralPurchaseRFQService()
        update_data = GeneralPurchaseRFQUpdate(title="Updated RFQ Title")
        
        updated_rfq = service.update(db_session, test_rfq.id, update_data.model_dump(exclude_unset=True))
        
        assert updated_rfq is not None
        assert updated_rfq.title == "Updated RFQ Title"
        assert updated_rfq.id == test_rfq.id
    
    def test_delete_rfq(self, db_session, test_rfq):
        """Test deleting an RFQ."""
        service = GeneralPurchaseRFQService()
        
        result = service.delete(db_session, test_rfq.id)
        
        assert result is True
        
        # Verify RFQ is deleted
        deleted_rfq = service.get(db_session, test_rfq.id)
        assert deleted_rfq is None


class TestAttachmentsService:
    """Test cases for AttachmentsService."""
    
    def test_create_attachment(self, db_session, test_rfq):
        """Test creating an attachment."""
        service = AttachmentsService()
        attachment_data = AttachmentsCreate(
            rfq_id=test_rfq.id,
            filename="test.pdf",
            file_path="/uploads/test.pdf",
            file_size=1024,
            content_type="application/pdf",
            attachment_type="DOCUMENT"
        )
        
        attachment = service.create_attachment(db_session, attachment_data)
        
        assert attachment.id is not None
        assert attachment.rfq_id == test_rfq.id
        assert attachment.filename == "test.pdf"
        assert attachment.file_size == 1024
    
    def test_get_attachment(self, db_session, test_rfq):
        """Test getting an attachment by ID."""
        service = AttachmentsService()
        attachment_data = AttachmentsCreate(
            rfq_id=test_rfq.id,
            filename="test.pdf",
            file_path="/uploads/test.pdf",
            file_size=1024,
            content_type="application/pdf",
            attachment_type="DOCUMENT"
        )
        
        attachment = service.create_attachment(db_session, attachment_data)
        retrieved_attachment = service.get(db_session, attachment.id)
        
        assert retrieved_attachment is not None
        assert retrieved_attachment.id == attachment.id
        assert retrieved_attachment.filename == attachment.filename
    
    def test_get_attachments_by_rfq(self, db_session, test_rfq):
        """Test getting attachments by RFQ."""
        service = AttachmentsService()
        attachment_data = AttachmentsCreate(
            rfq_id=test_rfq.id,
            filename="test.pdf",
            file_path="/uploads/test.pdf",
            file_size=1024,
            content_type="application/pdf",
            attachment_type="DOCUMENT"
        )
        
        service.create_attachment(db_session, attachment_data)
        attachments = service.get_attachments_by_rfq(db_session, test_rfq.id)
        
        assert len(attachments) >= 1
        assert all(attachment.rfq_id == test_rfq.id for attachment in attachments)
    
    def test_upload_file(self, db_session, test_rfq, temp_file):
        """Test uploading a file."""
        service = AttachmentsService()
        upload_data = AttachmentsUpload(rfq_id=test_rfq.id)
        
        with open(temp_file, 'rb') as f:
            file_content = f.read()
        
        attachment = service.upload_file(
            db_session, 
            file_content, 
            "test.txt", 
            upload_data
        )
        
        assert attachment.id is not None
        assert attachment.rfq_id == test_rfq.id
        assert attachment.filename == "test.txt"
    
    def test_delete_attachment(self, db_session, test_rfq):
        """Test deleting an attachment."""
        service = AttachmentsService()
        attachment_data = AttachmentsCreate(
            rfq_id=test_rfq.id,
            filename="test.pdf",
            file_path="/uploads/test.pdf",
            file_size=1024,
            content_type="application/pdf",
            attachment_type="DOCUMENT"
        )
        
        attachment = service.create_attachment(db_session, attachment_data)
        result = service.delete_attachment(db_session, attachment.id)
        
        assert result is True
        
        # Verify attachment is deleted
        deleted_attachment = service.get(db_session, attachment.id)
        assert deleted_attachment is None
