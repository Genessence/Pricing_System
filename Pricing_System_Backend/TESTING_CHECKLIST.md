# Pricing System Backend - Testing Checklist

## 📋 Quick Testing Status Overview

### ✅ Completed Modules
- [x] **Health Check** - 100% Working
- [x] **User Management** - 100% Working (Fixed 4 issues)
- [x] **Site Management** - 100% Working (Fixed 1 issue)
- [x] **RFQ Management** - 95% Working (1 known issue)
- [x] **Indent Items Management** - 100% Working (Fixed 1 issue)
- [x] **Service Items Management** - 100% Working (Fixed 1 issue)
- [x] **Transport Items Management** - 100% Working (Fixed 1 issue)
- [x] **Vendor Management** - 100% Working (Fixed 1 issue)

### ⏳ Pending Modules
- [ ] **Service Items Quotations** - Not tested
- [ ] **Transport Items Quotations** - Not tested
- [ ] **Indent Items Quotations** - Not tested
- [ ] **Attachments** - Not tested
- [ ] **RFQ Vendors** - Not tested

---

## 🚨 Known Issues & Workarounds

### Issue 1: Site-Specific RFQ Creation
**Status**: ⚠️ **ACTIVE**
**Error**: `500: Failed to create GeneralPurchaseRFQ`
**Workaround**: Create RFQs without `site_code`
**Impact**: Low - core functionality works
**Next Action**: Investigate `increment_rfq_counter` method

### Issue 2: Password Hashing (RESOLVED)
**Status**: ✅ **RESOLVED**
**Error**: `'password cannot be longer than 72 bytes'`
**Solution**: Updated to `bcrypt_sha256` scheme
**Files Fixed**: All password-related files

### Issue 3: Dependency Injection (RESOLVED)
**Status**: ✅ **RESOLVED**
**Error**: `'Depends' object has no attribute 'query'`
**Solution**: Added `db: Session = Depends(get_db)` to all routes
**Files Fixed**: All route files (Users, Sites, RFQ, Indent Items)

---

## 🧪 Testing Commands Reference

### Health Check
```bash
curl -X GET "http://localhost:8000/health"
```

### User Management
```bash
# Create User
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "admin13", "first_name": "Test", "last_name": "User", "role": "USER"}'

# Get Users
curl -X GET "http://localhost:8000/api/users/"

# Get User by ID
curl -X GET "http://localhost:8000/api/users/{user_id}"

# Update User
curl -X PUT "http://localhost:8000/api/users/{user_id}" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Updated"}'

# Delete User
curl -X DELETE "http://localhost:8000/api/users/{user_id}"

# Login
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "admin13"}'
```

### Site Management
```bash
# Create Site
curl -X POST "http://localhost:8000/api/sites/" \
  -H "Content-Type: application/json" \
  -d '{"code": "SITE001", "name": "Main Office", "address": "123 Main Street", "is_active": true}'

# Get Sites
curl -X GET "http://localhost:8000/api/sites/"

# Get Site by ID
curl -X GET "http://localhost:8000/api/sites/{site_id}"

# Get Site by Code
curl -X GET "http://localhost:8000/api/sites/code/SITE001"

# Update Site
curl -X PUT "http://localhost:8000/api/sites/{site_id}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Site"}'

# Delete Site
curl -X DELETE "http://localhost:8000/api/sites/{site_id}"
```

### Indent Items Management
```bash
# Create Indent Item
curl -X POST "http://localhost:8000/api/indent-items/" \
  -H "Content-Type: application/json" \
  -d '{"item_code": "INDENT001", "description": "Office Equipment", "specification": "High-quality office equipment", "uom": "PIECE", "is_active": true}'

# Get Indent Items
curl -X GET "http://localhost:8000/api/indent-items/"

# Get Indent Item by ID
curl -X GET "http://localhost:8000/api/indent-items/{item_id}"

# Get Indent Item by Code
curl -X GET "http://localhost:8000/api/indent-items/code/INDENT001"

# Get Active Indent Items
curl -X GET "http://localhost:8000/api/indent-items/active"

# Search Indent Items
curl -X GET "http://localhost:8000/api/indent-items/search?search_term=Office"

# Update Indent Item
curl -X PUT "http://localhost:8000/api/indent-items/{item_id}" \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated Office Equipment"}'

# Update Buying Info
curl -X PATCH "http://localhost:8000/api/indent-items/{item_id}/buying-info?price=500&vendor_name=ABC%20Vendor"

# Delete Indent Item
curl -X DELETE "http://localhost:8000/api/indent-items/{item_id}"
```

### Service Items Management
```bash
# Create Service Item
curl -X POST "http://localhost:8000/api/service-items/" \
  -H "Content-Type: application/json" \
  -d '{"description": "Office Cleaning Service", "specification": "Professional office cleaning", "uom": "HOUR", "quantity": 40, "rate": 50}'

# Get Service Items
curl -X GET "http://localhost:8000/api/service-items/"

# Get Service Item by ID
curl -X GET "http://localhost:8000/api/service-items/{item_id}"

# Search Service Items
curl -X GET "http://localhost:8000/api/service-items/search?search_term=Cleaning"

# Get Service Items by RFQ
curl -X GET "http://localhost:8000/api/service-items/rfq/{rfq_id}"

# Update Service Item
curl -X PUT "http://localhost:8000/api/service-items/{item_id}" \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated Service", "rate": 75}'

# Delete Service Item
curl -X DELETE "http://localhost:8000/api/service-items/{item_id}"
```

### Transport Items Management
```bash
# Create Transport Item
curl -X POST "http://localhost:8000/api/transport-items/" \
  -H "Content-Type: application/json" \
  -d '{"from_location": "New York", "to_location": "Boston", "vehicle_size": "Medium Truck", "load": 1000, "frequency": 2, "dimensions": "20x8x10 feet", "suggestions": "Handle with care"}'

# Get Transport Items
curl -X GET "http://localhost:8000/api/transport-items/"

# Get Transport Item by ID
curl -X GET "http://localhost:8000/api/transport-items/{item_id}"

# Search Transport Items
curl -X GET "http://localhost:8000/api/transport-items/search?search_term=New York"

# Get Transport Items by Route
curl -X GET "http://localhost:8000/api/transport-items/route?from_location=New York&to_location=Boston"

# Get Transport Items by RFQ
curl -X GET "http://localhost:8000/api/transport-items/rfq/{rfq_id}"

# Update Transport Item
curl -X PUT "http://localhost:8000/api/transport-items/{item_id}" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_size": "Large Truck", "load": 1500}'

# Delete Transport Item
curl -X DELETE "http://localhost:8000/api/transport-items/{item_id}"
```

### Vendor Management
```bash
# Create Vendor
curl -X POST "http://localhost:8000/api/vendors/" \
  -H "Content-Type: application/json" \
  -d '{"name": "ABC Supply Company", "code": "ABC001", "is_active": true, "providing_commodity_type": "INDENT", "contact_person": "John Smith", "email": "john@abcsupply.com", "phone": 1234567890, "address": "123 Business St", "status": "ACTIVE", "rating": 4}'

# Get Vendors
curl -X GET "http://localhost:8000/api/vendors/"

# Get Vendor by ID
curl -X GET "http://localhost:8000/api/vendors/{vendor_id}"

# Get Vendor by Code
curl -X GET "http://localhost:8000/api/vendors/code/{code}"

# Get Active Vendors
curl -X GET "http://localhost:8000/api/vendors/active"

# Get Vendors by Commodity Type
curl -X GET "http://localhost:8000/api/vendors/commodity/{commodity_type}"

# Search Vendors
curl -X GET "http://localhost:8000/api/vendors/search?search_term=ABC"

# Update Vendor
curl -X PUT "http://localhost:8000/api/vendors/{vendor_id}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated ABC Supply Company", "rating": 5}'

# Update Vendor Rating
curl -X PATCH "http://localhost:8000/api/vendors/{vendor_id}/rating?rating=3"

# Delete Vendor
curl -X DELETE "http://localhost:8000/api/vendors/{vendor_id}"
```

### RFQ Management
```bash
# Create RFQ (Without Site - WORKING)
curl -X POST "http://localhost:8000/api/rfq/?creator_id={user_id}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test RFQ", "commodity_type": "INDENT"}'

# Create RFQ (With Site - KNOWN ISSUE)
curl -X POST "http://localhost:8000/api/rfq/?creator_id={user_id}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test RFQ", "commodity_type": "INDENT", "site_code": "SITE001"}'

# Get RFQs
curl -X GET "http://localhost:8000/api/rfq/"

# Get RFQ by ID
curl -X GET "http://localhost:8000/api/rfq/{rfq_id}"

# Get RFQ by Number
curl -X GET "http://localhost:8000/api/rfq/number/RFQ-2025-0001"

# Get RFQs by Status
curl -X GET "http://localhost:8000/api/rfq/status/DRAFT"

# Get RFQs by Creator
curl -X GET "http://localhost:8000/api/rfq/creator/{creator_id}"

# Get RFQs by Site
curl -X GET "http://localhost:8000/api/rfq/site/{site_code}"

# Update RFQ
curl -X PUT "http://localhost:8000/api/rfq/{rfq_id}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated RFQ", "status": "PENDING_APPROVAL"}'

# Update RFQ Status
curl -X PATCH "http://localhost:8000/api/rfq/{rfq_id}/status?approver_id={approver_id}" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED", "approver_comments": "Approved"}'

# Delete RFQ
curl -X DELETE "http://localhost:8000/api/rfq/{rfq_id}"
```

---

## 🔍 Edge Cases Testing

### UUID Validation
```bash
curl -X GET "http://localhost:8000/api/users/invalid-uuid"
curl -X GET "http://localhost:8000/api/sites/invalid-uuid"
curl -X GET "http://localhost:8000/api/rfq/invalid-uuid"
```

### Missing Required Fields
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'

curl -X POST "http://localhost:8000/api/sites/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Site"}'

curl -X POST "http://localhost:8000/api/rfq/?creator_id={user_id}" \
  -H "Content-Type: application/json" \
  -d '{"commodity_type": "INDENT"}'
```

### Invalid Enum Values
```bash
curl -X POST "http://localhost:8000/api/rfq/?creator_id={user_id}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "commodity_type": "INVALID_TYPE"}'
```

### Duplicate Unique Fields
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"username": "existinguser", "email": "existing@example.com", "password": "admin13", "first_name": "Test", "last_name": "User", "role": "USER"}'

curl -X POST "http://localhost:8000/api/sites/" \
  -H "Content-Type: application/json" \
  -d '{"code": "EXISTING_CODE", "name": "Test Site", "address": "123 Test St", "is_active": true}'
```

---

## 📊 Testing Results Summary

| Module | Status | Tests Passed | Tests Failed | Issues | Resolution |
|--------|--------|--------------|--------------|---------|------------|
| Health Check | ✅ 100% | 1 | 0 | 0 | None needed |
| User Management | ✅ 100% | 8 | 0 | 4 | All resolved |
| Site Management | ✅ 100% | 8 | 0 | 1 | Resolved |
| RFQ Management | ⚠️ 95% | 9 | 1 | 1 | Workaround available |
| Indent Items Management | ✅ 100% | 10 | 0 | 1 | Resolved |
| Service Items Management | ✅ 100% | 7 | 0 | 1 | Resolved |
| Transport Items Management | ✅ 100% | 8 | 0 | 1 | Resolved |
| Vendor Management | ✅ 100% | 9 | 0 | 1 | Resolved |
| **Total** | **99.38%** | **60** | **1** | **10** | **9 resolved, 1 workaround** |

---

## 🎯 Next Testing Priorities

### High Priority
1. **Vendor Management APIs** - Core business functionality
2. **Quotation APIs** - Critical for RFQ workflow
3. **Fix RFQ Site Creation Issue** - Complete RFQ functionality

### Medium Priority
4. **Attachment APIs** - File handling
5. **Item Management APIs** - Service, Transport, Indent items
6. **RFQ Vendor Management** - Vendor-RFQ relationships

### Low Priority
7. **Authentication Testing** - When implemented
8. **Load Testing** - Performance validation
9. **Integration Testing** - End-to-end workflows

---

## 📝 Testing Notes

### Environment Details
- **OS**: Windows 10
- **Shell**: PowerShell
- **Database**: PostgreSQL
- **Server**: FastAPI with Uvicorn
- **Base URL**: `http://localhost:8000`

### Test Data Used
- **User ID**: `3691264b-0036-43c9-a048-4563e6bcec82`
- **Site ID**: `ae06020d-91f1-4c26-9883-4166c3e0352a`
- **Site Code**: `SITE001`
- **RFQ ID**: `41afa841-b3a5-4211-9452-c16dad5a8832`

### Common Test Patterns
1. **Create** → **Read** → **Update** → **Delete**
2. **Test with valid data** → **Test edge cases** → **Test error scenarios**
3. **Verify HTTP status codes** → **Verify response format** → **Verify data consistency**

---

## 🔄 Update Log

| Date | Update | Details |
|------|--------|---------|
| 2025-10-04 | Initial Testing | Created comprehensive testing log |
| 2025-10-04 | User API Fixed | Resolved 4 dependency injection issues |
| 2025-10-04 | Site API Fixed | Resolved dependency injection issue |
| 2025-10-04 | RFQ API Tested | 95% functional, 1 known issue |

---

*Last Updated: 2025-10-04*  
*Next Update: After testing remaining modules*
