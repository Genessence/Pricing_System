#!/usr/bin/env python3
"""
Server Status Check Script
Quick script to verify if the FastAPI server is running and accessible.
"""

import requests
import sys
from urllib.parse import urljoin

def check_server_status(base_url="http://localhost:8000"):
    """Check if the FastAPI server is running and accessible"""
    
    print(f"🔍 Checking server status at: {base_url}")
    print("=" * 50)
    
    # Test basic connectivity
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Server is running!")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ Server is not running or not accessible at {base_url}")
        print(f"   Make sure to start your FastAPI server with:")
        print(f"   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Server request timed out")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def check_health_endpoint(base_url="http://localhost:8000"):
    """Check the health endpoint"""
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Health endpoint accessible!")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def check_cors_endpoint(base_url="http://localhost:8000"):
    """Check the specific CORS endpoint that's failing"""
    endpoint = "/api/v1/rfqs/71/final-decision"
    url = urljoin(base_url, endpoint)
    
    print(f"\n🔍 Testing CORS endpoint: {url}")
    print("-" * 40)
    
    # Test OPTIONS request (preflight)
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        response = requests.options(url, headers=headers, timeout=5)
        print(f"OPTIONS Request:")
        print(f"   Status Code: {response.status_code}")
        
        # Check CORS headers
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        if cors_headers:
            print(f"   CORS Headers: {cors_headers}")
        else:
            print(f"   ❌ No CORS headers found!")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ OPTIONS request failed: {e}")
        return False

def main():
    base_url = "http://localhost:8000"
    
    print("🚀 QuoteFlow Pro Server Status Check")
    print("=" * 60)
    
    # Check if server is running
    if not check_server_status(base_url):
        sys.exit(1)
    
    # Check health endpoint
    check_health_endpoint(base_url)
    
    # Check CORS endpoint
    cors_ok = check_cors_endpoint(base_url)
    
    print(f"\n📊 Summary:")
    print(f"   Server Running: ✅")
    print(f"   Health Endpoint: ✅")
    print(f"   CORS Endpoint: {'✅' if cors_ok else '❌'}")
    
    if not cors_ok:
        print(f"\n💡 Troubleshooting:")
        print(f"   1. Make sure you've restarted the server after CORS changes")
        print(f"   2. Check server logs for CORS debug information")
        print(f"   3. Verify the endpoint exists in your API routes")

if __name__ == "__main__":
    main()
