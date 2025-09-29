"""
Unit tests for controller layer.
"""

import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session

from controllers.sites import SitesController
from controllers.users import UsersController
from controllers.vendors import VendorsController
from controllers.general_purchase_rfq import GeneralPurchaseRFQController
from controllers.attachments import AttachmentsController
from schemas.sites import SitesCreate, SitesUpdate
from schemas.users import UsersCreate, UsersUpdate, UsersLogin
from schemas.vendors import VendorsCreate, VendorsUpdate
from schemas.general_purchase_rfq import GeneralPurchaseRFQCreate, GeneralPurchaseRFQUpdate
from schemas.attachments import AttachmentsCreate, AttachmentsUpdate
from utils.error_handler import NotFoundError, ValidationError


class TestSitesController:
    """Test cases for SitesController."""
    
    def test_create_site_success(self, db_session, sample_site_data):
        """Test successful site creation."""
        controller = SitesController()
        site_data = SitesCreate(**sample_site_data)
        
        with patch.object(controller.service, 'create_site') as mock_create:
            mock_site = Mock()
            mock_site.id = "test-id"
            mock_site.code = sample_site_data["code"]
            mock_site.name = sample_site_data["name"]
            mock_create.return_value = mock_site
            
            result = controller.create_site(site_data, db_session)
            
            assert result is not None
            mock_create.assert_called_once_with(db_session, site_data)
    
    def test_create_site_error(self, db_session, sample_site_data):
        """Test site creation with error."""
        controller = SitesController()
        site_data = SitesCreate(**sample_site_data)
        
        with patch.object(controller.service, 'create_site') as mock_create:
            mock_create.side_effect = ValidationError("Invalid data")
            
            with pytest.raises(HTTPException) as exc_info:
                controller.create_site(site_data, db_session)
            
            assert exc_info.value.status_code == 400
    
    def test_get_site_success(self, db_session, test_site):
        """Test successful site retrieval."""
        controller = SitesController()
        
        with patch.object(controller.service, 'get') as mock_get:
            mock_site = Mock()
            mock_site.id = test_site.id
            mock_site.code = test_site.code
            mock_get.return_value = mock_site
            
            result = controller.get_site(test_site.id, db_session)
            
            assert result is not None
            mock_get.assert_called_once_with(db_session, test_site.id)
    
    def test_get_site_not_found(self, db_session):
        """Test site retrieval when not found."""
        controller = SitesController()
        
        with patch.object(controller.service, 'get') as mock_get:
            mock_get.return_value = None
            
            with pytest.raises(HTTPException) as exc_info:
                controller.get_site("non-existent-id", db_session)
            
            assert exc_info.value.status_code == 404
    
    def test_get_sites_success(self, db_session):
        """Test successful sites listing."""
        controller = SitesController()
        
        with patch.object(controller.service, 'get_multi') as mock_get_multi:
            mock_sites = [Mock(), Mock()]
            mock_get_multi.return_value = mock_sites
            
            result = controller.get_sites(skip=0, limit=10, db_session=db_session)
            
            assert len(result) == 2
            mock_get_multi.assert_called_once()
    
    def test_update_site_success(self, db_session, test_site):
        """Test successful site update."""
        controller = SitesController()
        update_data = SitesUpdate(name="Updated Site")
        
        with patch.object(controller.service, 'update_site') as mock_update:
            mock_site = Mock()
            mock_site.id = test_site.id
            mock_site.name = "Updated Site"
            mock_update.return_value = mock_site
            
            result = controller.update_site(test_site.id, update_data, db_session)
            
            assert result is not None
            mock_update.assert_called_once_with(db_session, test_site.id, update_data)
    
    def test_delete_site_success(self, db_session, test_site):
        """Test successful site deletion."""
        controller = SitesController()
        
        with patch.object(controller.service, 'delete') as mock_delete:
            mock_delete.return_value = True
            
            result = controller.delete_site(test_site.id, db_session)
            
            assert result["message"] == "Site deleted successfully"
            mock_delete.assert_called_once_with(db_session, test_site.id)


class TestUsersController:
    """Test cases for UsersController."""
    
    def test_create_user_success(self, db_session, test_site, sample_user_data):
        """Test successful user creation."""
        controller = UsersController()
        user_data = UsersCreate(**sample_user_data)
        user_data.site_id = test_site.id
        
        with patch.object(controller.service, 'create_user') as mock_create:
            mock_user = Mock()
            mock_user.id = "test-id"
            mock_user.username = sample_user_data["username"]
            mock_user.email = sample_user_data["email"]
            mock_create.return_value = mock_user
            
            result = controller.create_user(user_data, db_session)
            
            assert result is not None
            mock_create.assert_called_once_with(db_session, user_data)
    
    def test_authenticate_user_success(self, db_session, test_user):
        """Test successful user authentication."""
        controller = UsersController()
        login_data = UsersLogin(username=test_user.username, password="testpassword")
        
        with patch.object(controller.service, 'authenticate_user') as mock_auth:
            mock_user = Mock()
            mock_user.id = test_user.id
            mock_user.username = test_user.username
            mock_auth.return_value = mock_user
            
            result = controller.authenticate_user(login_data, db_session)
            
            assert result is not None
            mock_auth.assert_called_once_with(db_session, test_user.username, "testpassword")
    
    def test_authenticate_user_invalid_credentials(self, db_session):
        """Test authentication with invalid credentials."""
        controller = UsersController()
        login_data = UsersLogin(username="invalid", password="invalid")
        
        with patch.object(controller.service, 'authenticate_user') as mock_auth:
            mock_auth.return_value = None
            
            with pytest.raises(HTTPException) as exc_info:
                controller.authenticate_user(login_data, db_session)
            
            assert exc_info.value.status_code == 401
    
    def test_get_users_by_site_success(self, db_session, test_site):
        """Test successful users retrieval by site."""
        controller = UsersController()
        
        with patch.object(controller.service, 'get_users_by_site') as mock_get:
            mock_users = [Mock(), Mock()]
            mock_get.return_value = mock_users
            
            result = controller.get_users_by_site(test_site.id, db_session)
            
            assert len(result) == 2
            mock_get.assert_called_once_with(db_session, test_site.id)
    
    def test_update_user_success(self, db_session, test_user):
        """Test successful user update."""
        controller = UsersController()
        update_data = UsersUpdate(first_name="Updated Name")
        
        with patch.object(controller.service, 'update_user') as mock_update:
            mock_user = Mock()
            mock_user.id = test_user.id
            mock_user.first_name = "Updated Name"
            mock_update.return_value = mock_user
            
            result = controller.update_user(test_user.id, update_data, db_session)
            
            assert result is not None
            mock_update.assert_called_once_with(db_session, test_user.id, update_data)


class TestVendorsController:
    """Test cases for VendorsController."""
    
    def test_create_vendor_success(self, db_session, sample_vendor_data):
        """Test successful vendor creation."""
        controller = VendorsController()
        vendor_data = VendorsCreate(**sample_vendor_data)
        
        with patch.object(controller.service, 'create_vendor') as mock_create:
            mock_vendor = Mock()
            mock_vendor.id = "test-id"
            mock_vendor.code = sample_vendor_data["code"]
            mock_vendor.name = sample_vendor_data["name"]
            mock_create.return_value = mock_vendor
            
            result = controller.create_vendor(vendor_data, db_session)
            
            assert result is not None
            mock_create.assert_called_once_with(db_session, vendor_data)
    
    def test_get_vendor_success(self, db_session, test_vendor):
        """Test successful vendor retrieval."""
        controller = VendorsController()
        
        with patch.object(controller.service, 'get') as mock_get:
            mock_vendor = Mock()
            mock_vendor.id = test_vendor.id
            mock_vendor.code = test_vendor.code
            mock_get.return_value = mock_vendor
            
            result = controller.get_vendor(test_vendor.id, db_session)
            
            assert result is not None
            mock_get.assert_called_once_with(db_session, test_vendor.id)
    
    def test_search_vendors_success(self, db_session):
        """Test successful vendor search."""
        controller = VendorsController()
        
        with patch.object(controller.service, 'search_vendors') as mock_search:
            mock_vendors = [Mock(), Mock()]
            mock_search.return_value = mock_vendors
            
            result = controller.search_vendors("test", db_session)
            
            assert len(result) == 2
            mock_search.assert_called_once_with(db_session, "test")
    
    def test_update_vendor_rating_success(self, db_session, test_vendor):
        """Test successful vendor rating update."""
        controller = VendorsController()
        new_rating = 5
        
        with patch.object(controller.service, 'update_vendor_rating') as mock_update:
            mock_vendor = Mock()
            mock_vendor.id = test_vendor.id
            mock_vendor.rating = new_rating
            mock_update.return_value = mock_vendor
            
            result = controller.update_vendor_rating(test_vendor.id, new_rating, db_session)
            
            assert result is not None
            mock_update.assert_called_once_with(db_session, test_vendor.id, new_rating)
    
    def test_delete_vendor_success(self, db_session, test_vendor):
        """Test successful vendor deletion."""
        controller = VendorsController()
        
        with patch.object(controller.service, 'delete') as mock_delete:
            mock_delete.return_value = True
            
            result = controller.delete_vendor(test_vendor.id, db_session)
            
            assert result["message"] == "Vendor deleted successfully"
            mock_delete.assert_called_once_with(db_session, test_vendor.id)


class TestGeneralPurchaseRFQController:
    """Test cases for GeneralPurchaseRFQController."""
    
    def test_create_rfq_success(self, db_session, test_user, sample_rfq_data):
        """Test successful RFQ creation."""
        controller = GeneralPurchaseRFQController()
        rfq_data = GeneralPurchaseRFQCreate(**sample_rfq_data)
        
        with patch.object(controller.service, 'create_rfq') as mock_create:
            mock_rfq = Mock()
            mock_rfq.id = "test-id"
            mock_rfq.title = sample_rfq_data["title"]
            mock_create.return_value = mock_rfq
            
            result = controller.create_rfq(rfq_data, test_user.id, db_session)
            
            assert result is not None
            mock_create.assert_called_once_with(db_session, rfq_data, test_user.id)
    
    def test_get_rfq_success(self, db_session, test_rfq):
        """Test successful RFQ retrieval."""
        controller = GeneralPurchaseRFQController()
        
        with patch.object(controller.service, 'get') as mock_get:
            mock_rfq = Mock()
            mock_rfq.id = test_rfq.id
            mock_rfq.title = test_rfq.title
            mock_get.return_value = mock_rfq
            
            result = controller.get_rfq(test_rfq.id, db_session)
            
            assert result is not None
            mock_get.assert_called_once_with(db_session, test_rfq.id)
    
    def test_get_rfqs_by_status_success(self, db_session, test_rfq):
        """Test successful RFQs retrieval by status."""
        controller = GeneralPurchaseRFQController()
        
        with patch.object(controller.service, 'get_rfqs_by_status') as mock_get:
            mock_rfqs = [Mock(), Mock()]
            mock_get.return_value = mock_rfqs
            
            result = controller.get_rfqs_by_status(test_rfq.status, db_session)
            
            assert len(result) == 2
            mock_get.assert_called_once_with(db_session, test_rfq.status)
    
    def test_update_rfq_success(self, db_session, test_rfq):
        """Test successful RFQ update."""
        controller = GeneralPurchaseRFQController()
        update_data = GeneralPurchaseRFQUpdate(title="Updated RFQ")
        
        with patch.object(controller.service, 'update') as mock_update:
            mock_rfq = Mock()
            mock_rfq.id = test_rfq.id
            mock_rfq.title = "Updated RFQ"
            mock_update.return_value = mock_rfq
            
            result = controller.update_rfq(test_rfq.id, update_data, db_session)
            
            assert result is not None
            mock_update.assert_called_once()
    
    def test_delete_rfq_success(self, db_session, test_rfq):
        """Test successful RFQ deletion."""
        controller = GeneralPurchaseRFQController()
        
        with patch.object(controller.service, 'delete') as mock_delete:
            mock_delete.return_value = True
            
            result = controller.delete_rfq(test_rfq.id, db_session)
            
            assert result["message"] == "RFQ deleted successfully"
            mock_delete.assert_called_once_with(db_session, test_rfq.id)


class TestAttachmentsController:
    """Test cases for AttachmentsController."""
    
    def test_create_attachment_success(self, db_session, test_rfq):
        """Test successful attachment creation."""
        controller = AttachmentsController()
        attachment_data = AttachmentsCreate(
            rfq_id=test_rfq.id,
            filename="test.pdf",
            file_path="/uploads/test.pdf",
            file_size=1024,
            content_type="application/pdf",
            attachment_type="DOCUMENT"
        )
        
        with patch.object(controller.service, 'create_attachment') as mock_create:
            mock_attachment = Mock()
            mock_attachment.id = "test-id"
            mock_attachment.filename = "test.pdf"
            mock_create.return_value = mock_attachment
            
            result = controller.create_attachment(attachment_data, db_session)
            
            assert result is not None
            mock_create.assert_called_once_with(db_session, attachment_data)
    
    def test_upload_file_success(self, db_session, test_rfq, temp_file):
        """Test successful file upload."""
        controller = AttachmentsController()
        upload_data = AttachmentsUpload(rfq_id=test_rfq.id)
        
        with patch.object(controller.service, 'upload_file') as mock_upload:
            mock_attachment = Mock()
            mock_attachment.id = "test-id"
            mock_attachment.filename = "test.txt"
            mock_upload.return_value = mock_attachment
            
            with open(temp_file, 'rb') as f:
                file_content = f.read()
            
            result = controller.upload_file(
                file_content, 
                "test.txt", 
                test_rfq.id, 
                None, 
                None, 
                db_session
            )
            
            assert result is not None
            mock_upload.assert_called_once()
    
    def test_get_attachment_success(self, db_session, test_rfq):
        """Test successful attachment retrieval."""
        controller = AttachmentsController()
        
        with patch.object(controller.service, 'get') as mock_get:
            mock_attachment = Mock()
            mock_attachment.id = "test-id"
            mock_attachment.filename = "test.pdf"
            mock_get.return_value = mock_attachment
            
            result = controller.get_attachment("test-id", db_session)
            
            assert result is not None
            mock_get.assert_called_once_with(db_session, "test-id")
    
    def test_get_attachment_not_found(self, db_session):
        """Test attachment retrieval when not found."""
        controller = AttachmentsController()
        
        with patch.object(controller.service, 'get') as mock_get:
            mock_get.return_value = None
            
            with pytest.raises(HTTPException) as exc_info:
                controller.get_attachment("non-existent-id", db_session)
            
            assert exc_info.value.status_code == 404
    
    def test_update_attachment_success(self, db_session, test_rfq):
        """Test successful attachment update."""
        controller = AttachmentsController()
        update_data = AttachmentsUpdate(filename="updated.pdf")
        
        with patch.object(controller.service, 'update') as mock_update:
            mock_attachment = Mock()
            mock_attachment.id = "test-id"
            mock_attachment.filename = "updated.pdf"
            mock_update.return_value = mock_attachment
            
            result = controller.update_attachment("test-id", update_data, db_session)
            
            assert result is not None
            mock_update.assert_called_once()
    
    def test_delete_attachment_success(self, db_session):
        """Test successful attachment deletion."""
        controller = AttachmentsController()
        
        with patch.object(controller.service, 'delete_attachment') as mock_delete:
            mock_delete.return_value = True
            
            result = controller.delete_attachment("test-id", db_session)
            
            assert result["message"] == "Attachment deleted successfully"
            mock_delete.assert_called_once_with(db_session, "test-id")
