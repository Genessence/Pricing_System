"""
Pytest configuration and fixtures for the test suite.
"""
import pytest
import asyncio
from typing import Generator, AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import tempfile
import os
from datetime import datetime, timezone
from uuid import uuid4

from app import app
from config.database import get_db, Base
from config.settings import settings
from models.users import Users
from models.sites import Sites
from models.vendors import Vendors
from models.general_purchase_rfq import GeneralPurchaseRFQ
from middleware.auth import get_password_hash, create_access_token


# Test database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Create a fresh database session for each test.
    
    Yields:
        Database session
    """
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with database dependency override.
    
    Args:
        db_session: Database session
        
    Yields:
        FastAPI test client
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_site(db_session: Session) -> Sites:
    """
    Create a test site.
    
    Args:
        db_session: Database session
        
    Returns:
        Test site object
    """
    site = Sites(
        id=uuid4(),
        code="TEST001",
        name="Test Site",
        address="123 Test Street",
        city="Test City",
        state="Test State",
        country="Test Country",
        postal_code="12345",
        contact_person="Test Person",
        contact_email="test@example.com",
        contact_phone="1234567890",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db_session.add(site)
    db_session.commit()
    db_session.refresh(site)
    
    return site


@pytest.fixture
def test_user(db_session: Session, test_site: Sites) -> Users:
    """
    Create a test user.
    
    Args:
        db_session: Database session
        test_site: Test site object
        
    Returns:
        Test user object
    """
    user = Users(
        id=uuid4(),
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        first_name="Test",
        last_name="User",
        role="USER",
        site_id=test_site.id,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return user


@pytest.fixture
def test_admin_user(db_session: Session, test_site: Sites) -> Users:
    """
    Create a test admin user.
    
    Args:
        db_session: Database session
        test_site: Test site object
        
    Returns:
        Test admin user object
    """
    admin_user = Users(
        id=uuid4(),
        username="admin",
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword"),
        first_name="Admin",
        last_name="User",
        role="ADMIN",
        site_id=test_site.id,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)
    
    return admin_user


@pytest.fixture
def test_vendor(db_session: Session) -> Vendors:
    """
    Create a test vendor.
    
    Args:
        db_session: Database session
        
    Returns:
        Test vendor object
    """
    vendor = Vendors(
        id=uuid4(),
        code="VENDOR001",
        name="Test Vendor",
        contact_person="Vendor Person",
        contact_email="vendor@example.com",
        contact_phone="9876543210",
        address="456 Vendor Street",
        city="Vendor City",
        state="Vendor State",
        country="Vendor Country",
        postal_code="54321",
        providing_commodity_type="INDENT",
        status="ACTIVE",
        rating=4,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db_session.add(vendor)
    db_session.commit()
    db_session.refresh(vendor)
    
    return vendor


@pytest.fixture
def test_rfq(db_session: Session, test_user: Users, test_site: Sites) -> GeneralPurchaseRFQ:
    """
    Create a test RFQ.
    
    Args:
        db_session: Database session
        test_user: Test user object
        test_site: Test site object
        
    Returns:
        Test RFQ object
    """
    rfq = GeneralPurchaseRFQ(
        id=uuid4(),
        rfq_number="RFQ-2024-001",
        title="Test RFQ",
        description="Test RFQ Description",
        commodity_type="INDENT",
        status="DRAFT",
        site_code=test_site.code,
        created_by=test_user.id,
        total_value=1000.00,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db_session.add(rfq)
    db_session.commit()
    db_session.refresh(rfq)
    
    return rfq


@pytest.fixture
def auth_headers(test_user: Users) -> dict:
    """
    Create authentication headers for test user.
    
    Args:
        test_user: Test user object
        
    Returns:
        Authentication headers dictionary
    """
    token = create_access_token(
        data={"sub": str(test_user.id), "role": test_user.role, "site_id": str(test_user.site_id)}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(test_admin_user: Users) -> dict:
    """
    Create authentication headers for test admin user.
    
    Args:
        test_admin_user: Test admin user object
        
    Returns:
        Authentication headers dictionary
    """
    token = create_access_token(
        data={"sub": str(test_admin_user.id), "role": test_admin_user.role, "site_id": str(test_admin_user.site_id)}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def temp_file():
    """
    Create a temporary file for testing file uploads.
    
    Yields:
        Temporary file path
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp_file:
        tmp_file.write(b"Test file content")
        tmp_file_path = tmp_file.name
    
    yield tmp_file_path
    
    # Cleanup
    if os.path.exists(tmp_file_path):
        os.unlink(tmp_file_path)


@pytest.fixture
def sample_rfq_data():
    """
    Sample RFQ data for testing.
    
    Returns:
        Dictionary with sample RFQ data
    """
    return {
        "title": "Test RFQ",
        "description": "Test RFQ Description",
        "commodity_type": "INDENT",
        "site_code": "TEST001",
        "total_value": 1000.00
    }


@pytest.fixture
def sample_user_data():
    """
    Sample user data for testing.
    
    Returns:
        Dictionary with sample user data
    """
    return {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "newpassword123",
        "first_name": "New",
        "last_name": "User",
        "role": "USER",
        "site_id": None
    }


@pytest.fixture
def sample_vendor_data():
    """
    Sample vendor data for testing.
    
    Returns:
        Dictionary with sample vendor data
    """
    return {
        "code": "VENDOR002",
        "name": "New Vendor",
        "contact_person": "New Person",
        "contact_email": "newvendor@example.com",
        "contact_phone": "1111111111",
        "address": "789 New Street",
        "city": "New City",
        "state": "New State",
        "country": "New Country",
        "postal_code": "99999",
        "providing_commodity_type": "SERVICE",
        "status": "ACTIVE",
        "rating": 3
    }
