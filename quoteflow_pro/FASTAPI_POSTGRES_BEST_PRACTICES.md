# FastAPI & PostgreSQL Best Practices - QuoteFlow Pro

**Framework**: FastAPI + PostgreSQL + SQLAlchemy  
**Architecture**: Clean Architecture with Domain-Driven Design  
**Standards**: Enterprise-grade development practices  

---

## 🏗️ **Project Structure & Architecture**

### **1. Directory Organization**
```
quoteflow-pro-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection and session
│   ├── dependencies.py         # Dependency injection
│   ├── models/                 # SQLAlchemy models (Data Layer)
│   ├── schemas/                # Pydantic schemas (API Layer)
│   ├── api/                    # API routes (Presentation Layer)
│   ├── services/               # Business logic (Domain Layer)
│   ├── repositories/           # Data access layer
│   ├── core/                   # Core functionality
│   └── utils/                  # Utility functions
├── alembic/                    # Database migrations
├── tests/                      # Test suite
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
└── README.md
```

### **2. Clean Architecture Principles**
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Separation of Concerns**: Clear boundaries between layers
- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Open for extension, closed for modification

---

## 🗄️ **Database Design Best Practices**

### **1. PostgreSQL Configuration**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set proper timezone
SET timezone = 'UTC';

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### **2. Table Design Principles**
```sql
-- Use UUIDs for primary keys (security and scalability)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add proper indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Use partial indexes for active records
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;
```

### **3. SQLAlchemy Model Best Practices**
```python
# app/models/base.py
from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declared_attr

class CustomBase:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=False)

Base = declarative_base(cls=CustomBase)

# app/models/user.py
from sqlalchemy import Column, String, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    SUPPLIER = "supplier"

class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships with proper cascade settings
    rfqs = relationship("RFQ", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
```

---

## 🚀 **FastAPI Best Practices**

### **1. Application Configuration**
```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core.config import settings
from app.api.v1 import api_router

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        version=settings.VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
    )
    
    # Add middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )
    
    # Include routers
    app.include_router(api_router, prefix="/api/v1")
    
    return app

app = create_application()
```

### **2. API Route Best Practices**
```python
# app/api/v1/rfqs.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.dependencies import get_current_active_user, get_db
from app.models.user import User
from app.schemas.rfq import RFQCreate, RFQUpdate, RFQResponse, RFQList
from app.services.rfq_service import RFQService
from app.core.exceptions import ResourceNotFound, PermissionDenied

router = APIRouter()

@router.post("/", response_model=RFQResponse, status_code=status.HTTP_201_CREATED)
async def create_rfq(
    rfq_data: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new RFQ.
    
    Args:
        rfq_data: RFQ creation data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created RFQ with complete details
        
    Raises:
        HTTPException: If validation fails or business rules violated
    """
    try:
        return await RFQService.create_rfq(db, rfq_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=List[RFQList])
async def get_rfqs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status: Optional[str] = Query(None, description="Filter by RFQ status"),
    commodity_type: Optional[str] = Query(None, description="Filter by commodity type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get paginated list of RFQs with optional filtering.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        status: Filter by RFQ status
        commodity_type: Filter by commodity type
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of RFQs matching criteria
    """
    return await RFQService.get_rfqs(
        db, current_user, skip, limit, status, commodity_type
    )
```

### **3. Pydantic Schema Best Practices**
```python
# app/schemas/rfq.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID
import enum

class CommodityType(str, enum.Enum):
    PROVIDED_DATA = "provided_data"
    SERVICE = "service"
    TRANSPORT = "transport"

class RFQStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RFQItemBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=500)
    specifications: Optional[str] = Field(None, max_length=1000)
    required_quantity: int = Field(..., gt=0)
    uom: str = Field(..., min_length=1, max_length=50)
    last_buying_price: Optional[float] = Field(None, ge=0)
    last_vendor: Optional[str] = Field(None, max_length=100)

class RFQCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    commodity_type: CommodityType
    total_value: float = Field(..., gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    items: List[RFQItemBase] = Field(..., min_items=1)
    supplier_ids: List[UUID] = Field(..., min_items=1)
    
    @validator('total_value')
    def validate_total_value(cls, v):
        if v <= 0:
            raise ValueError('Total value must be greater than 0')
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        valid_currencies = ['INR', 'USD', 'EUR', 'GBP']
        if v not in valid_currencies:
            raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v

class RFQResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    commodity_type: CommodityType
    status: RFQStatus
    total_value: float
    currency: str
    user_id: UUID
    submitted_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }
```

---

## 🔐 **Security Best Practices**

### **1. Authentication & Authorization**
```python
# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import secrets

# Use strong password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Generate secure secret keys
SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None,
    scopes: Optional[List[str]] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire, 
        "sub": str(subject),
        "scopes": scopes or [],
        "type": "access"
    }
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Password strength validation
def validate_password_strength(password: str) -> bool:
    """
    Validate password meets security requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return all([has_upper, has_lower, has_digit, has_special])
```

### **2. Dependency Injection Security**
```python
# app/dependencies.py
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import ALGORITHM
from app.database import get_db
from app.models.user import User, UserRole
from app.core.exceptions import InsufficientPermissions

security = HTTPBearer(auto_error=True)

async def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Args:
        db: Database session
        credentials: JWT credentials from Authorization header
        
    Returns:
        Authenticated user object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Validate token type
        token_type = payload.get("type")
        if token_type != "access":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current admin user."""
    if current_user.role != UserRole.ADMIN:
        raise InsufficientPermissions("Admin access required")
    return current_user

def check_permission(required_permission: str):
    """Decorator to check specific permissions."""
    async def permission_checker(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        if required_permission not in current_user.permissions:
            raise InsufficientPermissions(f"Permission '{required_permission}' required")
        return current_user
    return permission_checker
```

---

## 🔧 **Service Layer Best Practices**

### **1. Service Architecture**
```python
# app/services/base_service.py
from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from app.models.base import Base
from app.core.exceptions import ResourceNotFound

ModelType = TypeVar("ModelType", bound=Base)

class BaseService(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    async def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Get single record by ID."""
        result = db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ModelType]:
        """Get multiple records with pagination."""
        result = db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def create(self, db: Session, obj_in: Any) -> ModelType:
        """Create new record."""
        db_obj = self.model(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    async def update(
        self, 
        db: Session, 
        id: Any, 
        obj_in: Any
    ) -> Optional[ModelType]:
        """Update existing record."""
        db_obj = await self.get(db, id)
        if not db_obj:
            raise ResourceNotFound(f"{self.model.__name__} not found")
        
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: Session, id: Any) -> bool:
        """Delete record by ID."""
        db_obj = await self.get(db, id)
        if not db_obj:
            raise ResourceNotFound(f"{self.model.__name__} not found")
        
        db.delete(db_obj)
        db.commit()
        return True

# app/services/rfq_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models.rfq import RFQ, RFQStatus
from app.models.user import User, UserRole
from app.schemas.rfq import RFQCreate, RFQUpdate
from app.services.base_service import BaseService
from app.core.exceptions import PermissionDenied, ResourceNotFound, ValidationError

class RFQService(BaseService[RFQ]):
    def __init__(self):
        super().__init__(RFQ)
    
    async def create_rfq(
        self, 
        db: Session, 
        rfq_data: RFQCreate, 
        user_id: int
    ) -> RFQ:
        """Create new RFQ with business logic validation."""
        # Validate business rules
        if rfq_data.total_value <= 0:
            raise ValidationError("Total value must be greater than 0")
        
        if len(rfq_data.items) == 0:
            raise ValidationError("RFQ must have at least one item")
        
        # Create RFQ
        rfq_dict = rfq_data.dict()
        rfq_dict['user_id'] = user_id
        rfq_dict['status'] = RFQStatus.DRAFT
        
        return await self.create(db, rfq_dict)
    
    async def get_rfqs(
        self,
        db: Session,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        commodity_type: Optional[str] = None
    ) -> List[RFQ]:
        """Get RFQs with role-based filtering and business logic."""
        query = select(self.model)
        
        # Apply role-based filtering
        if current_user.role == UserRole.USER:
            query = query.where(self.model.user_id == current_user.id)
        
        # Apply business filters
        if status:
            query = query.where(self.model.status == status)
        if commodity_type:
            query = query.where(self.model.commodity_type == commodity_type)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        result = db.execute(query)
        return result.scalars().all()
    
    async def approve_rfq(
        self,
        db: Session,
        rfq_id: int,
        approver_id: int,
        comments: str
    ) -> RFQ:
        """Approve RFQ with business logic validation."""
        rfq = await self.get(db, rfq_id)
        if not rfq:
            raise ResourceNotFound("RFQ not found")
        
        # Business rule: Only pending RFQs can be approved
        if rfq.status != RFQStatus.PENDING:
            raise ValidationError("Only pending RFQs can be approved")
        
        # Update status
        rfq.status = RFQStatus.APPROVED
        
        # Create approval record (implement approval tracking)
        # ... approval logic here
        
        db.commit()
        db.refresh(rfq)
        return rfq
```

---

## 🧪 **Testing Best Practices**

### **1. Test Structure**
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import get_db, Base
from app.main import create_application
from app.core.config import settings

# Test database configuration
SQLALCHEMY_DATABASE_URL = "postgresql://test_user:test_pass@localhost/test_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create test database and session."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """Create test client with database override."""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app = create_application()
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db):
    """Create admin user for testing."""
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    
    user = User(
        username="admin_test",
        email="admin@test.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin Test",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def regular_user(db):
    """Create regular user for testing."""
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    
    user = User(
        username="user_test",
        email="user@test.com",
        hashed_password=get_password_hash("user123"),
        full_name="User Test",
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
```

### **2. API Testing**
```python
# tests/test_api/test_rfqs.py
import pytest
from fastapi.testclient import TestClient
from app.models.rfq import RFQStatus
from app.schemas.rfq import CommodityType

def test_create_rfq_success(client: TestClient, regular_user, admin_token):
    """Test successful RFQ creation."""
    rfq_data = {
        "title": "Test RFQ",
        "description": "Test description",
        "commodity_type": CommodityType.SERVICE,
        "total_value": 1000.0,
        "currency": "INR",
        "items": [
            {
                "description": "Test item",
                "required_quantity": 10,
                "uom": "pieces"
            }
        ],
        "supplier_ids": ["123e4567-e89b-12d3-a456-426614174000"]
    }
    
    response = client.post(
        "/api/v1/rfqs/",
        json=rfq_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == rfq_data["title"]
    assert data["status"] == RFQStatus.DRAFT
    assert data["user_id"] == str(regular_user.id)

def test_create_rfq_validation_error(client: TestClient, admin_token):
    """Test RFQ creation with validation errors."""
    invalid_rfq_data = {
        "title": "",  # Empty title
        "total_value": -100,  # Negative value
        "items": []  # Empty items
    }
    
    response = client.post(
        "/api/v1/rfqs/",
        json=invalid_rfq_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("title" in str(error) for error in errors)
    assert any("total_value" in str(error) for error in errors)
    assert any("items" in str(error) for error in errors)

def test_get_rfqs_unauthorized(client: TestClient):
    """Test RFQ retrieval without authentication."""
    response = client.get("/api/v1/rfqs/")
    assert response.status_code == 401
```

---

## 🚀 **Performance Best Practices**

### **1. Database Optimization**
```python
# app/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from app.core.config import settings

# Connection pooling configuration
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG
)

# Session configuration
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Database event listeners for performance
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set SQLite pragmas for better performance."""
    if "sqlite" in str(dbapi_connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=10000")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.close()

# Optimize session usage
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### **2. Caching Strategy**
```python
# app/core/cache.py
from typing import Optional, Any
import redis
import json
from app.core.config import settings

class RedisCache:
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True
        )
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            value = self.redis_client.get(key)
            return json.loads(value) if value else None
        except Exception:
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: int = 3600
    ) -> bool:
        """Set value in cache with expiration."""
        try:
            serialized_value = json.dumps(value)
            return self.redis_client.setex(key, expire, serialized_value)
        except Exception:
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            return bool(self.redis_client.delete(key))
        except Exception:
            return False
    
    async def invalidate_pattern(self, pattern: str) -> bool:
        """Invalidate all keys matching pattern."""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return bool(self.redis_client.delete(*keys))
            return True
        except Exception:
            return False

# Cache decorator
def cache_result(expire: int = 3600, key_prefix: str = ""):
    """Decorator to cache function results."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, expire)
            return result
        return wrapper
    return decorator
```

---

## 📝 **Code Quality Standards**

### **1. Type Hints & Documentation**
```python
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel

async def process_rfq_items(
    items: List[Dict[str, Any]],
    user_id: int,
    validate_pricing: bool = True
) -> List[RFQItem]:
    """
    Process RFQ items with validation and business logic.
    
    Args:
        items: List of RFQ item dictionaries
        user_id: ID of the user creating the RFQ
        validate_pricing: Whether to validate pricing information
        
    Returns:
        List of processed RFQItem objects
        
    Raises:
        ValidationError: If item data is invalid
        PermissionDenied: If user lacks required permissions
    """
    processed_items = []
    
    for item_data in items:
        # Validate item data
        validated_item = await validate_rfq_item(item_data)
        
        # Apply business logic
        processed_item = await apply_business_rules(validated_item, user_id)
        
        processed_items.append(processed_item)
    
    return processed_items
```

### **2. Error Handling**
```python
# app/core/exceptions.py
from fastapi import HTTPException, status

class QuoteFlowException(Exception):
    """Base exception for QuoteFlow Pro."""
    pass

class ResourceNotFound(QuoteFlowException):
    """Raised when a requested resource is not found."""
    pass

class PermissionDenied(QuoteFlowException):
    """Raised when user lacks required permissions."""
    pass

class ValidationError(QuoteFlowException):
    """Raised when data validation fails."""
    pass

class BusinessRuleViolation(QuoteFlowException):
    """Raised when business rules are violated."""
    pass

# Global exception handler
from fastapi import Request
from fastapi.responses import JSONResponse

async def quoteflow_exception_handler(request: Request, exc: QuoteFlowException):
    """Global exception handler for QuoteFlow exceptions."""
    if isinstance(exc, ResourceNotFound):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, PermissionDenied):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, ValidationError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, BusinessRuleViolation):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": str(exc)}
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )
```

---

## 🔒 **Security Best Practices**

### **1. Input Validation & Sanitization**
```python
from pydantic import BaseModel, Field, validator
import re

class UserInput(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    phone: Optional[str] = Field(None, regex=r"^\+?1?\d{9,15}$")
    
    @validator('username')
    def validate_username(cls, v):
        # Prevent SQL injection patterns
        if re.search(r'[;\'"]', v):
            raise ValueError('Username contains invalid characters')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        # Additional email validation
        if len(v) > 254:
            raise ValueError('Email too long')
        return v.lower()

# SQL injection prevention
def safe_query_builder(base_query, filters: Dict[str, Any]):
    """Build safe database queries with parameterized filters."""
    for field, value in filters.items():
        if hasattr(base_query.model, field):
            base_query = base_query.filter(
                getattr(base_query.model, field) == value
            )
    return base_query
```

### **2. Rate Limiting**
```python
from fastapi import HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Rate limiting decorator
def rate_limit(requests: int, window: int):
    """Apply rate limiting to endpoints."""
    return limiter.limit(f"{requests}/{window}")

# Apply to endpoints
@router.post("/", response_model=RFQResponse)
@rate_limit(10, 60)  # 10 requests per minute
async def create_rfq(
    rfq_data: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new RFQ with rate limiting."""
    return await RFQService.create_rfq(db, rfq_data, current_user.id)
```

---

## 📊 **Monitoring & Logging**

### **1. Structured Logging**
```python
import logging
import json
from datetime import datetime
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)

# Configure logging
def setup_logging():
    """Setup structured logging configuration."""
    logger = logging.getLogger("quoteflow")
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    # File handler
    file_handler = logging.FileHandler("quoteflow.log")
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)
    
    return logger

# Usage in services
logger = logging.getLogger("quoteflow.services.rfq")

async def create_rfq(self, db: Session, rfq_data: RFQCreate, user_id: int) -> RFQ:
    """Create new RFQ with logging."""
    logger.info(
        "Creating new RFQ",
        extra={
            'extra_fields': {
                'user_id': user_id,
                'rfq_title': rfq_data.title,
                'commodity_type': rfq_data.commodity_type,
                'total_value': rfq_data.total_value
            }
        }
    )
    
    try:
        # RFQ creation logic
        result = await self._create_rfq_internal(db, rfq_data, user_id)
        
        logger.info(
            "RFQ created successfully",
            extra={
                'extra_fields': {
                    'rfq_id': result.id,
                    'status': result.status
                }
            }
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "Failed to create RFQ",
            extra={
                'extra_fields': {
                    'error': str(e),
                    'user_id': user_id
                }
            },
            exc_info=True
        )
        raise
```

---

## 🚀 **Deployment Best Practices**

### **1. Environment Configuration**
```python
# app/core/config.py
from pydantic import BaseSettings, validator
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "QuoteFlow Pro"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080
    
    # Database
    DATABASE_URL: str
    DATABASE_TEST_URL: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000"]
    
    # File Upload
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "uploads"
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    @validator('SECRET_KEY')
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters')
        return v
    
    @validator('DATABASE_URL')
    def validate_database_url(cls, v):
        if not v.startswith('postgresql://'):
            raise ValueError('DATABASE_URL must be a PostgreSQL connection string')
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### **2. Health Checks**
```python
# app/api/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.cache import RedisCache
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with database and cache."""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "checks": {}
    }
    
    # Database health check
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Cache health check
    try:
        cache = RedisCache()
        await cache.set("health_check", "ok", 60)
        health_check_result = await cache.get("health_check")
        if health_check_result == "ok":
            health_status["checks"]["cache"] = "healthy"
        else:
            health_status["checks"]["cache"] = "unhealthy"
            health_status["status"] = "unhealthy"
    except Exception as e:
        health_status["checks"]["cache"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # System health check
    health_status["checks"]["system"] = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent
    }
    
    return health_status
```

---

## 📋 **Code Review Checklist**

### **1. Security Checklist**
- [ ] Input validation and sanitization implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection implemented
- [ ] CSRF protection implemented
- [ ] Authentication and authorization properly implemented
- [ ] Sensitive data encrypted
- [ ] Rate limiting applied where appropriate
- [ ] Error messages don't leak sensitive information

### **2. Performance Checklist**
- [ ] Database queries optimized with proper indexes
- [ ] N+1 query problems avoided
- [ ] Caching implemented for frequently accessed data
- [ ] Pagination implemented for large datasets
- [ ] Async/await used appropriately
- [ ] Database connection pooling configured
- [ ] File uploads handled efficiently

### **3. Code Quality Checklist**
- [ ] Type hints implemented throughout
- [ ] Comprehensive error handling
- [ ] Proper logging implemented
- [ ] Unit tests written with good coverage
- [ ] Code follows PEP 8 style guidelines
- [ ] Documentation and docstrings complete
- [ ] No hardcoded values or secrets

### **4. Testing Checklist**
- [ ] Unit tests for all business logic
- [ ] Integration tests for API endpoints
- [ ] Test database properly configured
- [ ] Mock external dependencies
- [ ] Edge cases and error scenarios tested
- [ ] Performance tests for critical paths
- [ ] Security tests implemented

---

**Remember**: These best practices ensure code quality, security, and maintainability. Always follow them in QuoteFlow Pro development! 🚀
