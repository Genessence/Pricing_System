#!/usr/bin/env python3
"""
Test Site Management and GP RFQ Numbering Workflow
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_site_gp_workflow():
    """Test complete workflow with sites and GP numbering"""
    print("🧪 Testing Site Management and GP RFQ Numbering Workflow")
    print("=" * 60)
    
    # Test 1: Health Check
    print("1. Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False
    
    # Test 2: Admin Login
    print("\n2. Testing Admin Login...")
    try:
        response = requests.post(f"{API_BASE}/auth/login", json={
            "username": "admin",
            "password": "admin123",
            "userType": "admin"
        })
        if response.status_code == 200:
            admin_token = response.json().get("access_token")
            print("✅ Admin login successful")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Admin login error: {str(e)}")
        return False
    
    # Test 3: User Login
    print("\n3. Testing User Login...")
    try:
        response = requests.post(f"{API_BASE}/auth/login", json={
            "username": "user",
            "password": "user123",
            "userType": "user"
        })
        if response.status_code == 200:
            user_token = response.json().get("access_token")
            print("✅ User login successful")
        else:
            print(f"❌ User login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ User login error: {str(e)}")
        return False
    
    # Test 4: Create Sites (Admin only)
    print("\n4. Testing Site Creation...")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create multiple sites
        sites_data = [
            {
                "site_code": "A001",
                "site_name": "Main Office",
                "location": "Mumbai",
                "address": "123 Business District, Mumbai, Maharashtra",
                "contact_person": "John Doe",
                "contact_email": "john@company.com",
                "contact_phone": "+91-9876543210"
            },
            {
                "site_code": "A002", 
                "site_name": "Branch Office",
                "location": "Delhi",
                "address": "456 Corporate Park, Delhi, NCR",
                "contact_person": "Jane Smith",
                "contact_email": "jane@company.com",
                "contact_phone": "+91-9876543211"
            },
            {
                "site_code": "A003",
                "site_name": "Factory Site",
                "location": "Pune",
                "address": "789 Industrial Area, Pune, Maharashtra",
                "contact_person": "Mike Johnson",
                "contact_email": "mike@company.com",
                "contact_phone": "+91-9876543212"
            }
        ]
        
        created_sites = []
        for site_data in sites_data:
            response = requests.post(f"{API_BASE}/sites/", json=site_data, headers=headers)
            if response.status_code == 200:
                site = response.json()
                created_sites.append(site)
                print(f"✅ Site created: {site['site_code']} - {site['site_name']}")
            else:
                print(f"❌ Site creation failed for {site_data['site_code']}: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Site creation error: {str(e)}")
        return False
    
    # Test 5: Get Sites
    print("\n5. Testing Site Retrieval...")
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_BASE}/sites/", headers=headers)
        if response.status_code == 200:
            sites = response.json()
            print(f"✅ Sites retrieved successfully - found {len(sites)} sites")
            for site in sites:
                print(f"   - {site['site_code']}: {site['site_name']} ({site['location']})")
        else:
            print(f"❌ Site retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Site retrieval error: {str(e)}")
        return False
    
    # Test 6: Create RFQs with GP Numbering
    print("\n6. Testing RFQ Creation with GP Numbering...")
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Create RFQs for different sites
        rfqs_data = [
            {
                "title": "Office Supplies for Main Office",
                "description": "RFQ for office supplies at main office location",
                "commodity_type": "provided_data",
                "total_value": 50000.0,
                "currency": "INR",
                "site_id": created_sites[0]["id"],  # A001
                "items": [
                    {
                        "item_code": "ITEM001",
                        "description": "Steel Rod 12mm",
                        "specifications": "Grade 60, 12mm diameter",
                        "unit_of_measure": "Meters",
                        "required_quantity": 100
                    }
                ]
            },
            {
                "title": "IT Equipment for Branch Office",
                "description": "RFQ for IT equipment at branch office",
                "commodity_type": "provided_data",
                "total_value": 75000.0,
                "currency": "INR",
                "site_id": created_sites[1]["id"],  # A002
                "items": [
                    {
                        "item_code": "ITEM002",
                        "description": "Cement Bag 50kg",
                        "specifications": "Portland cement, 50kg bag",
                        "unit_of_measure": "Bags",
                        "required_quantity": 50
                    }
                ]
            },
            {
                "title": "Machinery Parts for Factory",
                "description": "RFQ for machinery parts at factory site",
                "commodity_type": "provided_data",
                "total_value": 100000.0,
                "currency": "INR",
                "site_id": created_sites[2]["id"],  # A003
                "items": [
                    {
                        "item_code": "ITEM003",
                        "description": "Office Chair",
                        "specifications": "Ergonomic office chair",
                        "unit_of_measure": "Nos",
                        "required_quantity": 25
                    }
                ]
            }
        ]
        
        created_rfqs = []
        for rfq_data in rfqs_data:
            response = requests.post(f"{API_BASE}/rfqs/", json=rfq_data, headers=headers)
            if response.status_code == 200:
                rfq = response.json()
                created_rfqs.append(rfq)
                print(f"✅ RFQ created: {rfq['rfq_number']} - {rfq['title']}")
                print(f"   Site: {rfq['site']['site_code']} - {rfq['site']['site_name']}")
            else:
                print(f"❌ RFQ creation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ RFQ creation error: {str(e)}")
        return False
    
    # Test 7: Verify GP Numbering Sequence
    print("\n7. Testing GP Numbering Sequence...")
    try:
        expected_numbers = ["GP-A001-001", "GP-A002-001", "GP-A003-001"]
        actual_numbers = [rfq["rfq_number"] for rfq in created_rfqs]
        
        if actual_numbers == expected_numbers:
            print("✅ GP numbering sequence is correct")
            for i, rfq in enumerate(created_rfqs):
                print(f"   - {rfq['rfq_number']}: {rfq['title']}")
                print(f"     Format: GP-{rfq['site']['site_code']}-001")
        else:
            print(f"❌ GP numbering sequence incorrect")
            print(f"   Expected: {expected_numbers}")
            print(f"   Actual: {actual_numbers}")
            return False
            
    except Exception as e:
        print(f"❌ GP numbering verification error: {str(e)}")
        return False
    
    # Test 8: Get RFQs with Site Information
    print("\n8. Testing RFQ Retrieval with Site Information...")
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_BASE}/rfqs/", headers=headers)
        if response.status_code == 200:
            rfqs = response.json()
            print(f"✅ RFQs retrieved successfully - found {len(rfqs)} RFQs")
            for rfq in rfqs:
                print(f"   - {rfq['rfq_number']}: {rfq['title']}")
                print(f"     Site: {rfq['site']['site_code']} - {rfq['site']['site_name']}")
                print(f"     Value: ₹{rfq['total_value']:,.2f}")
        else:
            print(f"❌ RFQ retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ RFQ retrieval error: {str(e)}")
        return False
    
    # Test 9: Admin RFQ View with Site Information
    print("\n9. Testing Admin RFQ View with Site Information...")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_BASE}/rfqs/", headers=headers)
        if response.status_code == 200:
            rfqs = response.json()
            print(f"✅ Admin RFQ view successful - found {len(rfqs)} RFQs")
            for rfq in rfqs:
                print(f"   - {rfq['rfq_number']}: {rfq['title']}")
                print(f"     Site: {rfq['site']['site_code']} - {rfq['site']['site_name']}")
                print(f"     User: {rfq['user']['username']}")
        else:
            print(f"❌ Admin RFQ view failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Admin RFQ view error: {str(e)}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 All Site Management and GP RFQ Numbering tests passed!")
    print("✅ Database: PostgreSQL")
    print("✅ Site Management: Working")
    print("✅ GP RFQ Numbering: Working")
    print("✅ Site-RFQ Association: Working")
    print("✅ Admin Functions: Working")
    print("✅ User Functions: Working")
    
    return True

if __name__ == "__main__":
    success = test_site_gp_workflow()
    if success:
        print("\n🚀 Site Management and GP RFQ Numbering workflow completed successfully!")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
