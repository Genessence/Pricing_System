# Quick Test Reference - Pricing System API

## 🚀 Quick Start Testing

### 1. Health Check
```bash
curl -X GET "http://localhost:8000/health"
```

### 2. Basic CRUD Testing Sequence

#### Step 1: Create Site
```bash
curl -X POST "http://localhost:8000/api/sites/" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SITE001",
    "name": "Main Office",
    "address": "123 Main Street, City, State 12345",
    "is_active": true
  }'
```
**Save the returned `id` as `SITE_ID`**

#### Step 2: Create User
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "admin13",
    "first_name": "Test",
    "last_name": "User",
    "role": "USER",
    "site_id": "SITE_ID_FROM_STEP_1"
  }'
```
**Save the returned `id` as `USER_ID`**

#### Step 3: Create Vendor
```bash
curl -X POST "http://localhost:8000/api/vendors/" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "VENDOR001",
    "name": "ABC Suppliers Ltd",
    "email": "contact@abcsuppliers.com",
    "phone": "+1234567890",
    "address": "456 Business Ave, City, State 67890",
    "contact_person": "John Doe",
    "providing_commodity_type": "GOODS",
    "status": "ACTIVE",
    "is_active": true
  }'
```
**Save the returned `id` as `VENDOR_ID`**

#### Step 4: Create RFQ
```bash
curl -X POST "http://localhost:8000/api/rfq/?creator_id=USER_ID_FROM_STEP_2" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Office Supplies RFQ",
    "description": "Request for quotation for office supplies",
    "commodity_type": "GOODS",
    "site_code": "SITE001",
    "required_date": "2024-02-01",
    "budget": 50000.00,
    "status": "DRAFT"
  }'
```
**Save the returned `id` as `RFQ_ID`**

#### Step 5: Create Quotation
```bash
curl -X POST "http://localhost:8000/api/indent-quotations/" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": "RFQ_ID_FROM_STEP_4",
    "vendor_id": "VENDOR_ID_FROM_STEP_3",
    "item_code": "INDENT001",
    "description": "Office Equipment",
    "quantity": 10,
    "unit_price": 150.00,
    "total_price": 1500.00,
    "delivery_date": "2024-02-20",
    "remarks": "Bulk order discount"
  }'
```

---

## 🧪 Common Test Scenarios

### Authentication Testing
```bash
# Login
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "admin13"
  }'

# Invalid credentials
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "wrongpassword"
  }'
```

### Pagination Testing
```bash
# First page
curl -X GET "http://localhost:8000/api/users/?skip=0&limit=5"

# Second page
curl -X GET "http://localhost:8000/api/users/?skip=5&limit=5"

# Invalid pagination
curl -X GET "http://localhost:8000/api/users/?skip=-1&limit=2000"
```

### Filtering Testing
```bash
# Filter by active users
curl -X GET "http://localhost:8000/api/users/?is_active=true"

# Filter by role
curl -X GET "http://localhost:8000/api/users/?role=USER"

# Filter by site
curl -X GET "http://localhost:8000/api/users/?site_id=SITE_ID"

# Multiple filters
curl -X GET "http://localhost:8000/api/users/?is_active=true&role=USER&site_id=SITE_ID"
```

### Error Testing
```bash
# Invalid UUID
curl -X GET "http://localhost:8000/api/users/invalid-uuid"

# Non-existent resource
curl -X GET "http://localhost:8000/api/users/00000000-0000-0000-0000-000000000000"

# Missing required fields
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser"
  }'

# Duplicate unique field
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "admin13",
    "first_name": "Test",
    "last_name": "User",
    "role": "USER"
  }'
```

---

## 📊 Response Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 200 | Success | Valid request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required/failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🔍 Quick Debugging

### Check Server Status
```bash
curl -X GET "http://localhost:8000/health"
```

### View API Documentation
- Open browser: `http://localhost:8000/docs`
- Interactive testing available

### Check Logs
```bash
# If running with uvicorn
tail -f logs/app.log
```

### Test Database Connection
```bash
# Check if tables exist
curl -X GET "http://localhost:8000/api/users/"
```

---

## 📝 Testing Checklist

### ✅ Basic Functionality
- [ ] Health check returns 200
- [ ] Can create site
- [ ] Can create user
- [ ] Can create vendor
- [ ] Can create RFQ
- [ ] Can create quotation

### ✅ CRUD Operations
- [ ] Create (POST) - returns 201
- [ ] Read (GET) - returns 200 with data
- [ ] Update (PUT) - returns 200 with updated data
- [ ] Delete (DELETE) - returns 200/204

### ✅ Validation
- [ ] Required fields validation
- [ ] Data type validation
- [ ] Unique constraint validation
- [ ] Enum value validation

### ✅ Error Handling
- [ ] Invalid UUID format
- [ ] Non-existent resources
- [ ] Missing required fields
- [ ] Duplicate unique fields

### ✅ Edge Cases
- [ ] Pagination limits
- [ ] Empty result sets
- [ ] Large data sets
- [ ] Special characters in data

---

## 🚨 Common Issues & Solutions

### Issue: Connection Refused
**Solution**: Check if server is running
```bash
curl -X GET "http://localhost:8000/health"
```

### Issue: Validation Errors
**Solution**: Check request format and required fields
```bash
# Use proper Content-Type header
-H "Content-Type: application/json"
```

### Issue: UUID Format Errors
**Solution**: Use valid UUID4 format
```
Valid: 123e4567-e89b-12d3-a456-426614174000
Invalid: 123, test-uuid, 123e4567-e89b-12d3-a456-42661417400
```

### Issue: Rate Limiting
**Solution**: Wait between requests or adjust rate limit settings

---

## 📋 Environment Variables

Make sure these are set in your `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET_KEY=your-secret-key
DEBUG=true
```

---

## 🔧 Tools

### Command Line Testing
- **curl**: Basic API testing
- **httpie**: More user-friendly CLI tool
- **jq**: JSON processing and formatting

### GUI Testing
- **Postman**: Import the provided collection
- **Insomnia**: Alternative to Postman
- **Swagger UI**: Built-in at `/docs`

### Load Testing
- **Apache Bench (ab)**: Basic load testing
- **wrk**: Modern HTTP benchmarking tool
- **Artillery**: Advanced load testing

---

## 📚 Additional Resources

- **Full Documentation**: `API_TESTING_GUIDE.md`
- **Postman Collection**: `Pricing_System_API_Collection.json`
- **API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
