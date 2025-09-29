# Client Requirements Update - Site Management & GP RFQ Numbering

**Date**: [Current Date]  
**Status**: Documentation Updated  
**Impact**: High - Core System Changes  

---

## 📋 **Client Requirements Summary**

### **New Requirements Added:**

1. **Site-Based Quotation Forms**
   - Users fill out quotation forms from different sites
   - Each site has a unique code starting with "A00" followed by numbers
   - Examples: A001, A002, A003, etc.

2. **GP RFQ Numbering System**
   - RFQs are labeled with GP prefix, site code, and sequential numbers
   - GP stands for "General Purchase" (part of the system)
   - Format: GP-{SITE_CODE}-{REQUEST_NUMBER}
   - Examples: GP-A001-001, GP-A002-001, GP-A003-001, etc.

---

## 🔄 **Documents Updated**

### **1. PRD_QUOTEFLOW_PRO.md**

#### **Changes Made:**
- ✅ **User Stories Updated**: Added site selection and GP numbering to RFQ creation story
- ✅ **New User Story Added**: Site Management story for procurement specialists
- ✅ **Data Models Updated**: Added Sites table to data requirements
- ✅ **Data Relationships Updated**: Added Site-to-RFQ relationships

#### **Key Updates:**
```markdown
**Story 1: RFQ Creation** - Updated Acceptance Criteria:
- Select site location from unique site codes (A001, A002, A003, etc.)
- Generate unique RFQ numbers with GP prefix and site code (GP-A001-001, GP-A002-001, etc.)

**New Story 4: Site Management**:
- View all available sites with their unique codes (A001, A002, etc.)
- Select site location when creating RFQs
- Track RFQ distribution across different sites
- Generate site-specific procurement reports
- Maintain site master data with location details

**Data Models** - Added:
- Sites: Site locations with unique codes (A001, A002, A003, etc.)
- RFQs: Request for quotation data with GP prefix and site code numbering (GP-A001-001, GP-A002-001, etc.)

**Data Relationships** - Updated:
- One-to-Many: Site to RFQs
- Master-Transaction: Sites (master) to RFQs (transaction)
```

### **2. BACKEND_IMPLEMENTATION_PLAN.md**

#### **Changes Made:**
- ✅ **Database Schema Updated**: Added sites table to core tables
- ✅ **New Site Model Added**: Complete SQLAlchemy model for sites
- ✅ **RFQ Model Updated**: Added site_id foreign key and rfq_number field
- ✅ **New Site Management Endpoints**: Complete CRUD operations for sites
- ✅ **New Site Service**: Business logic for site management
- ✅ **RFQ Service Updated**: Added GP numbering generation logic

#### **Key Updates:**

**Database Schema:**
```sql
-- New Sites Table
sites (1) ←→ (many) rfqs

-- Updated RFQ Table
rfqs:
- rfq_number: GP-001, GP-002, etc.
- site_id: Foreign key to sites table
```

**New Site Model:**
```python
class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    site_code = Column(String(10), unique=True, index=True, nullable=False)  # A001, A002, etc.
    site_name = Column(String(200), nullable=False)
    location = Column(String(500))
    address = Column(String(1000))
    contact_person = Column(String(200))
    contact_email = Column(String(200))
    contact_phone = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    rfqs = relationship("RFQ", back_populates="site")
```

**Updated RFQ Model:**
```python
class RFQ(Base):
    __tablename__ = "rfqs"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_number = Column(String(20), unique=True, index=True, nullable=False)  # GP-A001-001, GP-A002-001, etc.
    title = Column(String(200), nullable=False)
    description = Column(Text)
    commodity_type = Column(Enum(CommodityType), nullable=False)
    status = Column(Enum(RFQStatus), default=RFQStatus.DRAFT)
    total_value = Column(Float, default=0.0)
    currency = Column(String(3), default="INR")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)  # NEW
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="rfqs")
    site = relationship("Site", back_populates="rfqs")  # NEW
    items = relationship("RFQItem", back_populates="rfq", cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="rfq", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="rfq", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="rfq", cascade="all, delete-orphan")
```

**New Site Management Endpoints:**
```python
# app/api/v1/sites.py
@router.get("/", response_model=List[SiteList])
async def get_sites(...)

@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(...)

@router.post("/", response_model=SiteResponse)
async def create_site(...)  # Admin only

@router.put("/{site_id}", response_model=SiteResponse)
async def update_site(...)  # Admin only

@router.delete("/{site_id}")
async def delete_site(...)  # Admin only
```

**New Site Service:**
```python
class SiteService:
    @staticmethod
    def get_sites(db: Session, skip: int = 0, limit: int = 100, is_active: bool = True) -> List[Site]
    
    @staticmethod
    def get_site(db: Session, site_id: int) -> Optional[Site]
    
    @staticmethod
    def create_site(db: Session, site_data: SiteCreate, user_id: int) -> Site
    
    @staticmethod
    def update_site(db: Session, site_id: int, site_data: SiteUpdate, current_user: User) -> Site
    
    @staticmethod
    def delete_site(db: Session, site_id: int, current_user: User) -> bool
```

**Updated RFQ Service with GP Numbering:**
```python
class RFQService:
    @staticmethod
    def generate_rfq_number(db: Session, site_code: str) -> str:
        """Generate unique RFQ number with GP prefix and site code"""
        # Get the highest existing RFQ number for this site
        last_rfq = db.query(RFQ).join(Site).filter(
            Site.site_code == site_code
        ).order_by(RFQ.id.desc()).first()
        
        if last_rfq and last_rfq.rfq_number:
            # Extract number from existing RFQ number (e.g., GP-A001-001 -> 1)
            try:
                parts = last_rfq.rfq_number.split('-')
                if len(parts) == 3 and parts[0] == 'GP' and parts[1] == site_code:
                    last_number = int(parts[2])
                    next_number = last_number + 1
                else:
                    next_number = 1
            except (IndexError, ValueError):
                next_number = 1
        else:
            next_number = 1
        
        return f"GP-{site_code}-{next_number:03d}"
    
    @staticmethod
    def create_rfq(db: Session, rfq_data: RFQCreate, user_id: int) -> RFQ:
        """Create new RFQ with validation and GP numbering"""
        # Get site code for RFQ numbering
        site = db.query(Site).filter(Site.id == rfq_data.site_id).first()
        if not site:
            raise ValueError("Invalid site ID")
        
        # Generate unique RFQ number with site code
        rfq_number = RFQService.generate_rfq_number(db, site.site_code)
        
        # Create RFQ with site association
        db_rfq = RFQ(
            rfq_number=rfq_number,
            title=rfq_data.title,
            description=rfq_data.description,
            commodity_type=rfq_data.commodity_type,
            total_value=rfq_data.total_value,
            currency=rfq_data.currency,
            site_id=rfq_data.site_id,  # NEW
            user_id=user_id,
            status=RFQStatus.DRAFT
        )
        # ... rest of the implementation
```

---

## 🧪 **Testing Strategy**

### **Test Script Created:**
- ✅ **test_site_gp_workflow.py**: Comprehensive test for site management and GP numbering

### **Test Coverage:**
1. **Site Management**:
   - Site creation (Admin only)
   - Site retrieval
   - Site validation

2. **GP RFQ Numbering**:
   - Sequential GP numbering with site code (GP-A001-001, GP-A002-001, GP-A003-001)
   - RFQ creation with site association
   - RFQ retrieval with site information

3. **Integration Testing**:
   - User workflow with site selection
   - Admin workflow with site management
   - Data consistency across tables

---

## 📊 **Database Impact**

### **New Tables:**
- **sites**: Site master data with unique codes (A001, A002, etc.)

### **Updated Tables:**
- **rfqs**: Added `rfq_number` and `site_id` fields

### **New Relationships:**
- **sites (1) ←→ (many) rfqs**: One site can have multiple RFQs

---

## 🚀 **Implementation Status**

### **Documentation:**
- ✅ **PRD Updated**: All user stories and requirements updated
- ✅ **Backend Plan Updated**: Complete implementation plan with new models and services
- ✅ **Test Strategy**: Comprehensive test script created

### **Next Steps:**
1. **Backend Implementation**: Implement the new models, services, and endpoints
2. **Database Migration**: Add sites table and update rfqs table
3. **Frontend Updates**: Update UI to include site selection and display GP numbers
4. **Testing**: Run comprehensive tests to validate the workflow

---

## 📋 **Summary**

The client requirements for site-based quotation forms and GP RFQ numbering have been successfully integrated into both the PRD and Backend Implementation Plan. The system now supports:

- **Site Management**: Unique site codes (A001, A002, A003, etc.)
- **GP RFQ Numbering**: Sequential numbering with site code (GP-A001-001, GP-A002-001, GP-A003-001, etc.)
- **Site-RFQ Association**: Each RFQ is linked to a specific site
- **Admin Controls**: Site management restricted to admin users
- **User Workflow**: Site selection during RFQ creation

All documentation has been updated to reflect these changes, and a comprehensive test strategy has been developed to validate the new functionality.

---

**Updated By**: Development Team  
**Review Status**: Ready for Implementation  
**Next Phase**: Backend Implementation with Site Management & GP Numbering
