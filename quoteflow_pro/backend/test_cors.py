#!/usr/bin/env python3
"""
CORS Testing Script for QuoteFlow Pro API
This script helps test CORS configuration and debug CORS issues.
"""

import requests
import json
from urllib.parse import urljoin

def test_cors_preflight(base_url, endpoint, origin="http://localhost:3000"):
    """Test CORS preflight request (OPTIONS)"""
    url = urljoin(base_url, endpoint)
    
    headers = {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
    
    print(f"Testing CORS preflight for: {url}")
    print(f"Origin: {origin}")
    print("-" * 50)
    
    try:
        response = requests.options(url, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  {key}: {value}")
        
        # Check for CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print(f"\nCORS Headers Found:")
        for key, value in cors_headers.items():
            status = "✅" if value else "❌"
            print(f"  {status} {key}: {value}")
            
        return response.status_code == 200 and cors_headers['Access-Control-Allow-Origin']
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_cors_actual_request(base_url, endpoint, origin="http://localhost:3000"):
    """Test actual CORS request"""
    url = urljoin(base_url, endpoint)
    
    headers = {
        'Origin': origin,
        'Content-Type': 'application/json'
    }
    
    print(f"\nTesting actual CORS request for: {url}")
    print(f"Origin: {origin}")
    print("-" * 50)
    
    try:
        # Try a GET request first (should work for most endpoints)
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  {key}: {value}")
        
        return response.status_code in [200, 401, 403, 404]  # Valid responses
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def main():
    base_url = "http://localhost:8000"
    endpoint = "/api/v1/rfqs/71/final-decision"
    
    print("🔍 CORS Testing for QuoteFlow Pro API")
    print("=" * 60)
    
    # Test different origins
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]
    
    for origin in origins:
        print(f"\n🌐 Testing origin: {origin}")
        print("=" * 40)
        
        # Test preflight
        preflight_ok = test_cors_preflight(base_url, endpoint, origin)
        
        # Test actual request
        actual_ok = test_cors_actual_request(base_url, endpoint, origin)
        
        print(f"\n📊 Results for {origin}:")
        print(f"  Preflight: {'✅ PASS' if preflight_ok else '❌ FAIL'}")
        print(f"  Actual: {'✅ PASS' if actual_ok else '❌ FAIL'}")
        
        if preflight_ok and actual_ok:
            print(f"  🎉 CORS working correctly for {origin}")
        else:
            print(f"  ⚠️  CORS issues detected for {origin}")
    
    print(f"\n💡 Troubleshooting Tips:")
    print(f"  1. Make sure your FastAPI server is running on {base_url}")
    print(f"  2. Check that CORS_ORIGINS includes your frontend URL")
    print(f"  3. Verify the endpoint exists: {base_url}{endpoint}")
    print(f"  4. For development, you can temporarily set CORS_ORIGINS=['*']")

if __name__ == "__main__":
    main()
