"""
Integration tests for API endpoints.
"""

import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestSitesAPI:
    """Integration tests for Sites API endpoints."""
    
    def test_create_site_success(self, client: TestClient, sample_site_data):
        """Test successful site creation via API."""
        response = client.post("/api/sites/", json=sample_site_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == sample_site_data["code"]
        assert data["name"] == sample_site_data["name"]
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_site_validation_error(self, client: TestClient):
        """Test site creation with validation error."""
        invalid_data = {"code": "TEST"}  # Missing required fields
        
        response = client.post("/api/sites/", json=invalid_data)
        
        assert response.status_code == 422
    
    def test_get_sites_success(self, client: TestClient, test_site):
        """Test successful sites listing via API."""
        response = client.get("/api/sites/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_site_by_id_success(self, client: TestClient, test_site):
        """Test successful site retrieval by ID via API."""
        response = client.get(f"/api/sites/{test_site.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_site.id)
        assert data["code"] == test_site.code
        assert data["name"] == test_site.name
    
    def test_get_site_by_id_not_found(self, client: TestClient):
        """Test site retrieval by non-existent ID via API."""
        response = client.get("/api/sites/00000000-0000-0000-0000-000000000000")
        
        assert response.status_code == 404
    
    def test_get_site_by_code_success(self, client: TestClient, test_site):
        """Test successful site retrieval by code via API."""
        response = client.get(f"/api/sites/code/{test_site.code}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == test_site.code
        assert data["name"] == test_site.name
    
    def test_update_site_success(self, client: TestClient, test_site):
        """Test successful site update via API."""
        update_data = {"name": "Updated Site Name"}
        
        response = client.put(f"/api/sites/{test_site.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Site Name"
        assert data["id"] == str(test_site.id)
    
    def test_delete_site_success(self, client: TestClient, test_site):
        """Test successful site deletion via API."""
        response = client.delete(f"/api/sites/{test_site.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Site deleted successfully"
    
    def test_get_active_sites_success(self, client: TestClient, test_site):
        """Test successful active sites listing via API."""
        response = client.get("/api/sites/active")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(site["is_active"] for site in data)


class TestUsersAPI:
    """Integration tests for Users API endpoints."""
    
    def test_create_user_success(self, client: TestClient, test_site, sample_user_data):
        """Test successful user creation via API."""
        sample_user_data["site_id"] = str(test_site.id)
        
        response = client.post("/api/users/", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == sample_user_data["username"]
        assert data["email"] == sample_user_data["email"]
        assert data["role"] == sample_user_data["role"]
        assert data["site_id"] == str(test_site.id)
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_get_users_success(self, client: TestClient, test_user):
        """Test successful users listing via API."""
        response = client.get("/api/users/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_user_by_id_success(self, client: TestClient, test_user):
        """Test successful user retrieval by ID via API."""
        response = client.get(f"/api/users/{test_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_user.id)
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email
    
    def test_authenticate_user_success(self, client: TestClient, test_user):
        """Test successful user authentication via API."""
        login_data = {
            "username": test_user.username,
            "password": "testpassword"
        }
        
        response = client.post("/api/users/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email
    
    def test_authenticate_user_invalid_credentials(self, client: TestClient):
        """Test authentication with invalid credentials via API."""
        login_data = {
            "username": "invalid",
            "password": "invalid"
        }
        
        response = client.post("/api/users/login", json=login_data)
        
        assert response.status_code == 401
    
    def test_get_users_by_site_success(self, client: TestClient, test_site, test_user):
        """Test successful users retrieval by site via API."""
        response = client.get(f"/api/users/site/{test_site.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(user["site_id"] == str(test_site.id) for user in data)
    
    def test_update_user_success(self, client: TestClient, test_user):
        """Test successful user update via API."""
        update_data = {"first_name": "Updated Name"}
        
        response = client.put(f"/api/users/{test_user.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated Name"
        assert data["id"] == str(test_user.id)
    
    def test_delete_user_success(self, client: TestClient, test_user):
        """Test successful user deletion via API."""
        response = client.delete(f"/api/users/{test_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "User deleted successfully"


class TestVendorsAPI:
    """Integration tests for Vendors API endpoints."""
    
    def test_create_vendor_success(self, client: TestClient, sample_vendor_data):
        """Test successful vendor creation via API."""
        response = client.post("/api/vendors/", json=sample_vendor_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == sample_vendor_data["code"]
        assert data["name"] == sample_vendor_data["name"]
        assert data["providing_commodity_type"] == sample_vendor_data["providing_commodity_type"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_get_vendors_success(self, client: TestClient, test_vendor):
        """Test successful vendors listing via API."""
        response = client.get("/api/vendors/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_vendor_by_id_success(self, client: TestClient, test_vendor):
        """Test successful vendor retrieval by ID via API."""
        response = client.get(f"/api/vendors/{test_vendor.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_vendor.id)
        assert data["code"] == test_vendor.code
        assert data["name"] == test_vendor.name
    
    def test_get_vendor_by_code_success(self, client: TestClient, test_vendor):
        """Test successful vendor retrieval by code via API."""
        response = client.get(f"/api/vendors/code/{test_vendor.code}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == test_vendor.code
        assert data["name"] == test_vendor.name
    
    def test_search_vendors_success(self, client: TestClient, test_vendor):
        """Test successful vendor search via API."""
        response = client.get(f"/api/vendors/search?search_term={test_vendor.name}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(test_vendor.name in vendor["name"] for vendor in data)
    
    def test_get_vendors_by_commodity_type_success(self, client: TestClient, test_vendor):
        """Test successful vendors retrieval by commodity type via API."""
        response = client.get(f"/api/vendors/commodity/{test_vendor.providing_commodity_type}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(vendor["providing_commodity_type"] == test_vendor.providing_commodity_type 
                  for vendor in data)
    
    def test_update_vendor_success(self, client: TestClient, test_vendor):
        """Test successful vendor update via API."""
        update_data = {"name": "Updated Vendor Name"}
        
        response = client.put(f"/api/vendors/{test_vendor.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Vendor Name"
        assert data["id"] == str(test_vendor.id)
    
    def test_update_vendor_rating_success(self, client: TestClient, test_vendor):
        """Test successful vendor rating update via API."""
        new_rating = 5
        
        response = client.patch(f"/api/vendors/{test_vendor.id}/rating?rating={new_rating}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["rating"] == new_rating
        assert data["id"] == str(test_vendor.id)
    
    def test_delete_vendor_success(self, client: TestClient, test_vendor):
        """Test successful vendor deletion via API."""
        response = client.delete(f"/api/vendors/{test_vendor.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Vendor deleted successfully"


class TestGeneralPurchaseRFQAPI:
    """Integration tests for General Purchase RFQ API endpoints."""
    
    def test_create_rfq_success(self, client: TestClient, test_user, sample_rfq_data):
        """Test successful RFQ creation via API."""
        response = client.post(
            f"/api/rfq/?creator_id={test_user.id}",
            json=sample_rfq_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_rfq_data["title"]
        assert data["description"] == sample_rfq_data["description"]
        assert data["commodity_type"] == sample_rfq_data["commodity_type"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_get_rfqs_success(self, client: TestClient, test_rfq):
        """Test successful RFQs listing via API."""
        response = client.get("/api/rfq/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_rfq_by_id_success(self, client: TestClient, test_rfq):
        """Test successful RFQ retrieval by ID via API."""
        response = client.get(f"/api/rfq/{test_rfq.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_rfq.id)
        assert data["title"] == test_rfq.title
        assert data["rfq_number"] == test_rfq.rfq_number
    
    def test_get_rfq_by_number_success(self, client: TestClient, test_rfq):
        """Test successful RFQ retrieval by number via API."""
        response = client.get(f"/api/rfq/number/{test_rfq.rfq_number}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["rfq_number"] == test_rfq.rfq_number
        assert data["title"] == test_rfq.title
    
    def test_get_rfqs_by_status_success(self, client: TestClient, test_rfq):
        """Test successful RFQs retrieval by status via API."""
        response = client.get(f"/api/rfq/status/{test_rfq.status}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(rfq["status"] == test_rfq.status for rfq in data)
    
    def test_get_rfqs_by_creator_success(self, client: TestClient, test_rfq):
        """Test successful RFQs retrieval by creator via API."""
        response = client.get(f"/api/rfq/creator/{test_rfq.created_by}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(rfq["created_by"] == str(test_rfq.created_by) for rfq in data)
    
    def test_get_rfqs_by_site_success(self, client: TestClient, test_rfq):
        """Test successful RFQs retrieval by site via API."""
        response = client.get(f"/api/rfq/site/{test_rfq.site_code}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(rfq["site_code"] == test_rfq.site_code for rfq in data)
    
    def test_update_rfq_success(self, client: TestClient, test_rfq):
        """Test successful RFQ update via API."""
        update_data = {"title": "Updated RFQ Title"}
        
        response = client.put(f"/api/rfq/{test_rfq.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated RFQ Title"
        assert data["id"] == str(test_rfq.id)
    
    def test_delete_rfq_success(self, client: TestClient, test_rfq):
        """Test successful RFQ deletion via API."""
        response = client.delete(f"/api/rfq/{test_rfq.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "RFQ deleted successfully"


class TestAttachmentsAPI:
    """Integration tests for Attachments API endpoints."""
    
    def test_create_attachment_success(self, client: TestClient, test_rfq):
        """Test successful attachment creation via API."""
        attachment_data = {
            "rfq_id": str(test_rfq.id),
            "filename": "test.pdf",
            "file_path": "/uploads/test.pdf",
            "file_size": 1024,
            "content_type": "application/pdf",
            "attachment_type": "DOCUMENT"
        }
        
        response = client.post("/api/attachments/", json=attachment_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["filename"] == attachment_data["filename"]
        assert data["file_size"] == attachment_data["file_size"]
        assert data["content_type"] == attachment_data["content_type"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_upload_file_success(self, client: TestClient, test_rfq, temp_file):
        """Test successful file upload via API."""
        with open(temp_file, 'rb') as f:
            files = {"file": ("test.txt", f, "text/plain")}
            data = {
                "rfq_id": str(test_rfq.id),
                "attachment_type": "DOCUMENT"
            }
            
            response = client.post("/api/attachments/upload", files=files, data=data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["filename"] == "test.txt"
        assert data["rfq_id"] == str(test_rfq.id)
    
    def test_get_attachments_success(self, client: TestClient):
        """Test successful attachments listing via API."""
        response = client.get("/api/attachments/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_attachments_by_rfq_success(self, client: TestClient, test_rfq):
        """Test successful attachments retrieval by RFQ via API."""
        response = client.get(f"/api/attachments/rfq/{test_rfq.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(attachment["rfq_id"] == str(test_rfq.id) for attachment in data)
    
    def test_get_attachment_by_id_success(self, client: TestClient, test_rfq):
        """Test successful attachment retrieval by ID via API."""
        # First create an attachment
        attachment_data = {
            "rfq_id": str(test_rfq.id),
            "filename": "test.pdf",
            "file_path": "/uploads/test.pdf",
            "file_size": 1024,
            "content_type": "application/pdf",
            "attachment_type": "DOCUMENT"
        }
        
        create_response = client.post("/api/attachments/", json=attachment_data)
        assert create_response.status_code == 201
        attachment_id = create_response.json()["id"]
        
        # Then retrieve it
        response = client.get(f"/api/attachments/{attachment_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == attachment_id
        assert data["filename"] == "test.pdf"
    
    def test_update_attachment_success(self, client: TestClient, test_rfq):
        """Test successful attachment update via API."""
        # First create an attachment
        attachment_data = {
            "rfq_id": str(test_rfq.id),
            "filename": "test.pdf",
            "file_path": "/uploads/test.pdf",
            "file_size": 1024,
            "content_type": "application/pdf",
            "attachment_type": "DOCUMENT"
        }
        
        create_response = client.post("/api/attachments/", json=attachment_data)
        assert create_response.status_code == 201
        attachment_id = create_response.json()["id"]
        
        # Then update it
        update_data = {"filename": "updated.pdf"}
        
        response = client.put(f"/api/attachments/{attachment_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "updated.pdf"
        assert data["id"] == attachment_id
    
    def test_delete_attachment_success(self, client: TestClient, test_rfq):
        """Test successful attachment deletion via API."""
        # First create an attachment
        attachment_data = {
            "rfq_id": str(test_rfq.id),
            "filename": "test.pdf",
            "file_path": "/uploads/test.pdf",
            "file_size": 1024,
            "content_type": "application/pdf",
            "attachment_type": "DOCUMENT"
        }
        
        create_response = client.post("/api/attachments/", json=attachment_data)
        assert create_response.status_code == 201
        attachment_id = create_response.json()["id"]
        
        # Then delete it
        response = client.delete(f"/api/attachments/{attachment_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Attachment deleted successfully"


class TestHealthCheckAPI:
    """Integration tests for health check and root endpoints."""
    
    def test_health_check_success(self, client: TestClient):
        """Test successful health check via API."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "app_name" in data
        assert "version" in data
        assert "timestamp" in data
    
    def test_root_endpoint_success(self, client: TestClient):
        """Test successful root endpoint via API."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "health_check" in data
