"""
Test script to verify backend setup.
"""
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test if all modules can be imported."""
    try:
        from app.main import app
        from app.core.config import settings
        from app.core.security import create_access_token, verify_password
        from app.models.user import User, UserRole
        from app.models.erp_item import ERPItem
        from app.models.rfq import RFQ, RFQStatus
        from app.schemas.user import UserCreate, UserResponse
        from app.schemas.erp_item import ERPItemCreate
        from app.schemas.rfq import RFQCreate
        print("✅ All imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_config():
    """Test configuration loading."""
    try:
        from app.core.config import settings
        print(f"✅ Project: {settings.PROJECT_NAME}")
        print(f"✅ Version: {settings.VERSION}")
        print(f"✅ Debug: {settings.DEBUG}")
        return True
    except Exception as e:
        print(f"❌ Config error: {e}")
        return False

def test_security():
    """Test security functions."""
    try:
        from app.core.security import get_password_hash, verify_password, create_access_token
        
        # Test password hashing
        password = "test123"
        hashed = get_password_hash(password)
        is_valid = verify_password(password, hashed)
        
        if is_valid:
            print("✅ Password hashing works!")
        else:
            print("❌ Password hashing failed!")
            return False
        
        # Test token creation
        token = create_access_token(subject=1)
        if token:
            print("✅ Token creation works!")
        else:
            print("❌ Token creation failed!")
            return False
            
        return True
    except Exception as e:
        print(f"❌ Security error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing QuoteFlow Pro Backend Setup...")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Config Test", test_config),
        ("Security Test", test_security)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed!")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend setup is ready!")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
