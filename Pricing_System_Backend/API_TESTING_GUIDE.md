# Pricing System Backend - API Testing Guide

## 📋 Overview

This document provides comprehensive testing guidelines for the Pricing System Backend API. The API is built with FastAPI and provides endpoints for managing users, sites, vendors, RFQs, and various quotation types.

**Base URL**: `http://localhost:8000`
**API Documentation**: `http://localhost:8000/docs` (Swagger UI)
**Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

---

## 🏥 Health Check

### GET /health
Check if the API is running and healthy.

**Request:**
```bash
curl -X GET "http://localhost:8000/health"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "app_name": "Pricing System Backend",
  "version": "1.0.0",
  "timestamp": 1759519251.5245128
}
```

**Edge Cases:**
- ✅ **Success**: 200 OK with health status
- ❌ **Server Down**: Connection refused
- ❌ **Database Issues**: Check logs for database connection errors

---

## 👤 User Management APIs

### POST /api/users/
Create a new user.

**Request:**
```bash
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

**Expected Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "role": "USER",
  "is_active": true,
  "site_id": null,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Edge Cases:**
- ❌ **Duplicate Username**: `{"detail": "Username already exists"}`
- ❌ **Duplicate Email**: `{"detail": "Email already exists"}`
- ❌ **Invalid Email**: `{"detail": "field required (type=value_error)"}`
- ❌ **Missing Required Fields**: `{"detail": "field required (type=value_error)"}`

### GET /api/users/
Get multiple users with optional filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/users/?skip=0&limit=10&is_active=true&role=USER"
```

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `limit` (int, optional): Number of records to return (default: 100, max: 1000)
- `is_active` (bool, optional): Filter by active status
- `role` (string, optional): Filter by role (USER, ADMIN, APPROVER)
- `site_id` (UUID, optional): Filter by site ID

**Edge Cases:**
- ✅ **Success**: 200 OK with user list
- ❌ **Invalid Limit**: `{"detail": "ensure this value is less than or equal to 1000"}`
- ❌ **Negative Skip**: `{"detail": "ensure this value is greater than or equal to 0"}`

### GET /api/users/active
Get all active users.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/users/active"
```

### GET /api/users/site/{site_id}
Get users for a specific site.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/users/site/123e4567-e89b-12d3-a456-426614174000"
```

**Edge Cases:**
- ❌ **Invalid UUID**: `{"detail": "Input should be a valid UUID"}`
- ❌ **Site Not Found**: `{"detail": "Site not found"}`

### GET /api/users/{user_id}
Get a user by ID.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/users/123e4567-e89b-12d3-a456-426614174000"
```

**Edge Cases:**
- ❌ **Invalid UUID**: `{"detail": "Input should be a valid UUID"}`
- ❌ **User Not Found**: `{"detail": "User not found"}`

### PUT /api/users/{user_id}
Update a user.

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name",
    "is_active": false
  }'
```

**Edge Cases:**
- ❌ **Duplicate Username**: `{"detail": "Username already exists"}`
- ❌ **Duplicate Email**: `{"detail": "Email already exists"}`
- ❌ **User Not Found**: `{"detail": "User not found"}`

### DELETE /api/users/{user_id}
Delete a user.

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/users/123e4567-e89b-12d3-a456-426614174000"
```

**Edge Cases:**
- ❌ **User Not Found**: `{"detail": "User not found"}`
- ❌ **User Has Dependencies**: Check for foreign key constraints

### POST /api/users/login
Authenticate a user.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "admin13"
  }'
```

**Edge Cases:**
- ❌ **Invalid Credentials**: `{"detail": "Invalid credentials"}`
- ❌ **Inactive User**: `{"detail": "User account is inactive"}`
- ❌ **Missing Fields**: `{"detail": "field required (type=value_error)"}`

---

## 🏢 Site Management APIs

### POST /api/sites/
Create a new site.

**Request:**
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

**Edge Cases:**
- ❌ **Duplicate Code**: `{"detail": "Site code already exists"}`
- ❌ **Missing Required Fields**: `{"detail": "field required (type=value_error)"}`

### GET /api/sites/
Get multiple sites with optional filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/sites/?skip=0&limit=10&is_active=true"
```

### GET /api/sites/active
Get all active sites.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/sites/active"
```

### GET /api/sites/{site_id}
Get a site by ID.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/sites/123e4567-e89b-12d3-a456-426614174000"
```

### PUT /api/sites/{site_id}
Update a site.

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/sites/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Site Name",
    "is_active": false
  }'
```

### DELETE /api/sites/{site_id}
Delete a site.

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/sites/123e4567-e89b-12d3-a456-426614174000"
```

---

## 🏪 Vendor Management APIs

### POST /api/vendors/
Create a new vendor.

**Request:**
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

**Edge Cases:**
- ❌ **Duplicate Code**: `{"detail": "Vendor code already exists"}`
- ❌ **Invalid Commodity Type**: `{"detail": "Input should be 'GOODS' or 'SERVICES'"}`
- ❌ **Invalid Status**: `{"detail": "Input should be 'ACTIVE' or 'INACTIVE'}"}`

### GET /api/vendors/
Get multiple vendors with optional filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/vendors/?skip=0&limit=10&is_active=true&commodity_type=GOODS"
```

**Query Parameters:**
- `skip`, `limit`, `is_active` (same as users)
- `status` (string, optional): Filter by status (ACTIVE, INACTIVE)
- `commodity_type` (string, optional): Filter by commodity type (GOODS, SERVICES)

### GET /api/vendors/active
Get all active vendors.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/vendors/active"
```

### GET /api/vendors/{vendor_id}
Get a vendor by ID.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/vendors/123e4567-e89b-12d3-a456-426614174000"
```

### PUT /api/vendors/{vendor_id}
Update a vendor.

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/vendors/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Vendor Name",
    "status": "INACTIVE"
  }'
```

### DELETE /api/vendors/{vendor_id}
Delete a vendor.

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/vendors/123e4567-e89b-12d3-a456-426614174000"
```

---

## 📋 RFQ Management APIs

### POST /api/rfq/
Create a new RFQ.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/rfq/?creator_id=123e4567-e89b-12d3-a456-426614174000" \
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

**Edge Cases:**
- ❌ **Invalid Creator ID**: `{"detail": "Creator not found"}`
- ❌ **Invalid Site Code**: `{"detail": "Site not found"}`
- ❌ **Invalid Commodity Type**: `{"detail": "Input should be 'GOODS' or 'SERVICES'"}`
- ❌ **Past Required Date**: `{"detail": "Required date cannot be in the past"}`

### GET /api/rfq/
Get multiple RFQs with optional filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/rfq/?skip=0&limit=10&status=DRAFT&commodity_type=GOODS"
```

**Query Parameters:**
- `skip`, `limit` (same as users)
- `status` (string, optional): Filter by status (DRAFT, PUBLISHED, CLOSED, CANCELLED)
- `commodity_type` (string, optional): Filter by commodity type
- `site_code` (string, optional): Filter by site code
- `created_by` (UUID, optional): Filter by creator

### GET /api/rfq/{rfq_id}
Get an RFQ by ID.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/rfq/123e4567-e89b-12d3-a456-426614174000"
```

### GET /api/rfq/number/{rfq_number}
Get an RFQ by RFQ number.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/rfq/number/RFQ-2024-001"
```

### PUT /api/rfq/{rfq_id}
Update an RFQ.

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/rfq/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated RFQ Title",
    "status": "PUBLISHED"
  }'
```

### DELETE /api/rfq/{rfq_id}
Delete an RFQ.

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/rfq/123e4567-e89b-12d3-a456-426614174000"
```

---

## 📄 Quotation APIs

### Service Items Quotations

#### POST /api/service-quotations/
Create a new service items quotation.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/service-quotations/" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": "123e4567-e89b-12d3-a456-426614174000",
    "vendor_id": "123e4567-e89b-12d3-a456-426614174001",
    "item_code": "SERVICE001",
    "description": "IT Support Services",
    "quantity": 1,
    "unit_price": 1000.00,
    "total_price": 1000.00,
    "delivery_date": "2024-02-15",
    "remarks": "Monthly IT support"
  }'
```

#### GET /api/service-quotations/
Get service quotations with filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/service-quotations/?rfq_id=123e4567-e89b-12d3-a456-426614174000"
```

### Transport Items Quotations

#### POST /api/transport-quotations/
Create a new transport items quotation.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/transport-quotations/" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": "123e4567-e89b-12d3-a456-426614174000",
    "vendor_id": "123e4567-e89b-12d3-a456-426614174001",
    "item_code": "TRANSPORT001",
    "description": "Freight Services",
    "quantity": 5,
    "unit_price": 200.00,
    "total_price": 1000.00,
    "delivery_date": "2024-02-10",
    "remarks": "Express delivery"
  }'
```

### Indent Items Quotations

#### POST /api/indent-quotations/
Create a new indent items quotation.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/indent-quotations/" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": "123e4567-e89b-12d3-a456-426614174000",
    "vendor_id": "123e4567-e89b-12d3-a456-426614174001",
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

## 📎 Attachment APIs

### POST /api/attachments/
Upload a file attachment.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/attachments/" \
  -F "file=@/path/to/file.pdf" \
  -F "entity_type=RFQ" \
  -F "entity_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "description=RFQ Document"
```

**Edge Cases:**
- ❌ **File Too Large**: `{"detail": "File size exceeds maximum allowed"}`
- ❌ **Invalid File Type**: `{"detail": "File type not allowed"}`
- ❌ **Entity Not Found**: `{"detail": "Referenced entity not found"}`

### GET /api/attachments/
Get attachments with filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/attachments/?entity_type=RFQ&entity_id=123e4567-e89b-12d3-a456-426614174000"
```

### GET /api/attachments/{attachment_id}
Download an attachment.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/attachments/123e4567-e89b-12d3-a456-426614174000" \
  -o downloaded_file.pdf
```

### DELETE /api/attachments/{attachment_id}
Delete an attachment.

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/attachments/123e4567-e89b-12d3-a456-426614174000"
```

---

## 🔗 RFQ Vendor Management APIs

### POST /api/rfq-vendors/
Add a vendor to an RFQ.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/rfq-vendors/" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": "123e4567-e89b-12d3-a456-426614174000",
    "vendor_id": "123e4567-e89b-12d3-a456-426614174001",
    "invitation_sent_at": "2024-01-01T12:00:00Z",
    "response_received_at": null,
    "status": "INVITED"
  }'
```

### GET /api/rfq-vendors/
Get RFQ vendors with filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/rfq-vendors/?rfq_id=123e4567-e89b-12d3-a456-426614174000"
```

---

## 🛠️ Item Management APIs

### Service Items

#### POST /api/service-items/
Create a new service item.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/service-items/" \
  -H "Content-Type: application/json" \
  -d '{
    "item_code": "SERVICE001",
    "name": "IT Support",
    "description": "Monthly IT support services",
    "category": "IT_SERVICES",
    "unit": "MONTH",
    "is_active": true
  }'
```

#### GET /api/service-items/
Get service items with filtering.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/service-items/?is_active=true"
```

### Transport Items

#### POST /api/transport-items/
Create a new transport item.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/transport-items/" \
  -H "Content-Type: application/json" \
  -d '{
    "item_code": "TRANSPORT001",
    "name": "Freight Services",
    "description": "Logistics and freight services",
    "category": "LOGISTICS",
    "unit": "TRIP",
    "is_active": true
  }'
```

### Indent Items

#### POST /api/indent-items/
Create a new indent item.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/indent-items/" \
  -H "Content-Type: application/json" \
  -d '{
    "item_code": "INDENT001",
    "name": "Office Equipment",
    "description": "Various office equipment items",
    "category": "EQUIPMENT",
    "unit": "PIECE",
    "is_active": true
  }'
```

---

## 🚨 Common Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation failed",
  "errors": [
    {
      "type": "value_error",
      "loc": ["body", "field_name"],
      "msg": "Field validation error message",
      "input": "invalid_value"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict
```json
{
  "detail": "Resource already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": "Validation failed",
  "errors": [
    {
      "type": "type_error.uuid",
      "loc": ["path", "id"],
      "msg": "Input should be a valid UUID",
      "input": "invalid-uuid"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## 🧪 Testing Workflow

### 1. Health Check
Always start with the health check to ensure the API is running.

### 2. Create Prerequisites
Create sites and vendors before creating RFQs and quotations.

### 3. Test CRUD Operations
For each resource type:
1. **Create** - Test with valid data
2. **Read** - Test GET endpoints with various filters
3. **Update** - Test PUT endpoints with partial data
4. **Delete** - Test DELETE endpoints

### 4. Test Edge Cases
- Invalid UUIDs
- Missing required fields
- Duplicate unique fields
- Invalid enum values
- Boundary conditions (limits, pagination)

### 5. Test Relationships
- Create RFQs with valid site codes
- Add vendors to RFQs
- Create quotations for existing RFQs and vendors
- Upload attachments for existing entities

### 6. Test Error Handling
- Invalid request formats
- Non-existent resources
- Permission errors
- Rate limiting

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- UUIDs should be valid UUID4 format
- File uploads have size and type restrictions
- Rate limiting is applied to prevent abuse
- All endpoints return JSON responses
- Use proper Content-Type headers for requests

---

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Refused**: Server not running
   - Check if server is started: `http://localhost:8000/health`

2. **Validation Errors**: Check request format and required fields
   - Refer to the API documentation at `/docs`

3. **Database Errors**: Check database connection and table existence
   - Verify PostgreSQL is running and accessible

4. **Rate Limiting**: Too many requests in a short time
   - Wait before making more requests

5. **File Upload Issues**: Check file size and type restrictions
   - Verify file exists and is within size limits
