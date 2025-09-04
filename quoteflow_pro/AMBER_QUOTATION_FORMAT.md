# Amber Quotation Label Format - QuoteFlow Pro

**Document Version**: 1.0  
**Date**: [Current Date]  
**Project**: QuoteFlow Pro - Amber Quotation System  
**Status**: Approved for Implementation  

---

## 📋 **Amber Quotation Label Format**

### **Format Structure**
```
GP-{SITE_CODE}-{REQUEST_NUMBER}
```

### **Format Breakdown**
- **GP** = General Purchase (system identifier)
- **{SITE_CODE}** = Site code where user is logged in (e.g., A001, A002, A003)
- **{REQUEST_NUMBER}** = Sequential request number for that specific site (001, 002, 003, etc.)

### **Examples**
```
GP-A001-001  → General Purchase from Site A001, Request #001
GP-A001-002  → General Purchase from Site A001, Request #002
GP-A002-001  → General Purchase from Site A002, Request #001
GP-A003-001  → General Purchase from Site A003, Request #001
```

---

## 🏢 **Site Code System**

### **Site Code Format**
- **Prefix**: Always starts with "A" (Amber)
- **Number**: Followed by 3-digit number (001, 002, 003, etc.)
- **Examples**: A001, A002, A003, A004, A005

### **Site Code Assignment**
- **A001**: Main Office / Headquarters
- **A002**: Branch Office / Regional Office
- **A003**: Factory Site / Manufacturing Plant
- **A004**: Warehouse / Distribution Center
- **A005**: Research & Development Center
- **A006+**: Additional sites as needed

---

## 🔢 **Request Numbering Logic**

### **Per-Site Sequential Numbering**
- Each site maintains its own sequential counter
- Request numbers start from 001 for each site
- Numbers increment independently per site
- Format: 3-digit zero-padded numbers (001, 002, 003, etc.)

### **Numbering Examples by Site**
```
Site A001:
- GP-A001-001 (First request from A001)
- GP-A001-002 (Second request from A001)
- GP-A001-003 (Third request from A001)

Site A002:
- GP-A002-001 (First request from A002)
- GP-A002-002 (Second request from A002)

Site A003:
- GP-A003-001 (First request from A003)
```

---

## 🗄️ **Database Implementation**

### **RFQ Number Generation Logic**
```python
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
```

### **Database Schema**
```sql
-- Sites table
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    site_code VARCHAR(10) UNIQUE NOT NULL,  -- A001, A002, etc.
    site_name VARCHAR(200) NOT NULL,
    location VARCHAR(500),
    address VARCHAR(1000),
    contact_person VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQs table
CREATE TABLE rfqs (
    id SERIAL PRIMARY KEY,
    rfq_number VARCHAR(20) UNIQUE NOT NULL,  -- GP-A001-001, GP-A002-001, etc.
    title VARCHAR(200) NOT NULL,
    description TEXT,
    commodity_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    total_value DECIMAL(15,2) DEFAULT 0.0,
    currency VARCHAR(3) DEFAULT 'INR',
    user_id INTEGER REFERENCES users(id),
    site_id INTEGER REFERENCES sites(id) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 **Workflow Integration**

### **RFQ Creation Process**
1. **User Login**: User logs in from a specific site (A001, A002, etc.)
2. **Site Selection**: System automatically detects user's site or allows selection
3. **RFQ Creation**: User creates new RFQ
4. **Number Generation**: System generates unique RFQ number with format `GP-{SITE_CODE}-{REQUEST_NUMBER}`
5. **Database Storage**: RFQ stored with generated number and site association

### **Site-Based Numbering**
- **Independent Counters**: Each site maintains separate request counters
- **No Global Sequence**: Request numbers are not globally sequential
- **Site-Specific**: GP-A001-001 and GP-A002-001 can exist simultaneously
- **Automatic Increment**: Next request from same site gets next sequential number

---

## 📊 **Business Logic**

### **Numbering Rules**
1. **Format Validation**: All RFQ numbers must follow `GP-{SITE_CODE}-{REQUEST_NUMBER}` format
2. **Site Validation**: Site code must exist in sites table
3. **Uniqueness**: RFQ numbers must be unique across the entire system
4. **Sequential**: Request numbers must be sequential within each site
5. **Zero Padding**: Request numbers must be 3-digit zero-padded (001, 002, 003)

### **Validation Examples**
```
✅ Valid Numbers:
- GP-A001-001
- GP-A001-002
- GP-A002-001
- GP-A003-001

❌ Invalid Numbers:
- GP-001-001 (missing A prefix)
- GP-A001-1 (not zero-padded)
- GP-A001-000 (starts from 000)
- GP-A001-1000 (too many digits)
```

---

## 🧪 **Testing Scenarios**

### **Test Case 1: First RFQ from Site A001**
```
Input: Site A001, First RFQ
Expected Output: GP-A001-001
```

### **Test Case 2: Second RFQ from Site A001**
```
Input: Site A001, Second RFQ
Expected Output: GP-A001-002
```

### **Test Case 3: First RFQ from Site A002**
```
Input: Site A002, First RFQ
Expected Output: GP-A002-001
```

### **Test Case 4: Multiple Sites Simultaneous**
```
Site A001: GP-A001-001, GP-A001-002, GP-A001-003
Site A002: GP-A002-001, GP-A002-002
Site A003: GP-A003-001
```

---

## 🔍 **Implementation Checklist**

### **Backend Implementation**
- [ ] Update RFQ model to include `rfq_number` field
- [ ] Update RFQ model to include `site_id` foreign key
- [ ] Implement `generate_rfq_number()` function
- [ ] Update RFQ creation service to use site-based numbering
- [ ] Add site validation in RFQ creation
- [ ] Update database migrations

### **Frontend Implementation**
- [ ] Add site selection in RFQ creation form
- [ ] Display RFQ numbers in correct format
- [ ] Show site information in RFQ listings
- [ ] Update RFQ details view to show site
- [ ] Add site filtering in RFQ search

### **Testing**
- [ ] Unit tests for number generation logic
- [ ] Integration tests for RFQ creation with sites
- [ ] End-to-end tests for complete workflow
- [ ] Validation tests for number format
- [ ] Performance tests for number generation

---

## 📋 **Summary**

The Amber Quotation Label Format ensures:

1. **Clear Identification**: Each RFQ is uniquely identified with site and sequence
2. **Site Organization**: RFQs are organized by site for better management
3. **Sequential Tracking**: Each site maintains its own request sequence
4. **Scalability**: System can handle multiple sites with independent numbering
5. **Business Logic**: Format reflects Amber's business structure and processes

**Format**: `GP-{SITE_CODE}-{REQUEST_NUMBER}`  
**Example**: `GP-A001-001` (General Purchase from Site A001, Request #001)

---

**Document Prepared By**: Development Team  
**Business Approval By**: Amber Management  
**Technical Review By**: System Architect  
**Implementation Status**: Ready for Development  

---

**Amber Quotation System** - Streamlining procurement with intelligent site-based numbering! 🚀
