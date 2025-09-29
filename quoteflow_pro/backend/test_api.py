"""
Test script to verify API endpoints are working.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_login():
    """Test login endpoint."""
    try:
        # Test admin login
        login_data = {
            "username": "admin",
            "password": "admin123",
            "userType": "admin"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
        print(f"✅ Admin login: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Access token: {data['access_token'][:20]}...")
            print(f"   User: {data['user']['username']} ({data['user']['role']})")
            return data['access_token']
        else:
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return None

def test_erp_items(token):
    """Test ERP items endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/erp-items/", headers=headers)
        print(f"✅ ERP Items: {response.status_code}")
        
        if response.status_code == 200:
            items = response.json()
            print(f"   Found {len(items)} ERP items")
            for item in items[:3]:  # Show first 3 items
                print(f"   - {item['item_code']}: {item['description']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ ERP Items test failed: {e}")

def test_rfqs(token):
    """Test RFQs endpoint."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/rfqs/", headers=headers)
        print(f"✅ RFQs: {response.status_code}")
        
        if response.status_code == 200:
            rfqs = response.json()
            print(f"   Found {len(rfqs)} RFQs")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ RFQs test failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing QuoteFlow Pro API Endpoints...")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("❌ Health check failed. Is the server running?")
        exit(1)
    
    print()
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Login failed. Check database initialization.")
        exit(1)
    
    print()
    
    # Test authenticated endpoints
    test_erp_items(token)
    print()
    test_rfqs(token)
    
    print("\n" + "=" * 50)
    print("🎉 API testing completed!")
