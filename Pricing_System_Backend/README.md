# Pricing System Backend

A comprehensive backend API for managing Request for Quotations (RFQ), vendors, items, and quotations built with FastAPI, SQLAlchemy, and PostgreSQL.

## 🏗️ Architecture

This project follows a strict **MVSC (Model-View-Service-Controller)** architecture pattern:

- **Models**: SQLAlchemy ORM models for database tables
- **Views**: FastAPI routes and endpoints
- **Services**: Business logic and data operations
- **Controllers**: HTTP request/response handling

## 📁 Project Structure

```
/project-root
├── config/                  # Environment variables, DB settings, app configs
├── models/                  # SQLAlchemy ORM models
├── schemas/                 # Pydantic models for validation
├── controllers/             # HTTP request/response handlers
├── services/                # Business logic and DB operations
├── routes/                  # FastAPI routers and endpoints
├── middleware/              # Auth, CORS, rate limiting
├── utils/                   # Reusable helpers and utilities
├── tests/                   # Test suites
├── app.py                   # FastAPI application entry point
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 12+
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pricing-system-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your configuration
   # At minimum, set:
   # - DATABASE_URL
   # - SECRET_KEY
   # - JWT_SECRET_KEY
   ```

5. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb pricing_system_db
   
   # The application will create tables automatically on startup
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   
   # Production mode
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

7. **Access the application**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pricing_system_db

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Application
DEBUG=true
LOG_LEVEL=INFO
```

### Database Configuration

The application uses PostgreSQL with SQLAlchemy ORM. Database tables are created automatically on startup.

## 📚 API Documentation

### Core Endpoints

- **RFQ Management**: `/api/rfq`
- **Vendor Management**: `/api/vendors`
- **User Management**: `/api/users`
- **Site Management**: `/api/sites`
- **Items Management**: `/api/indent-items`, `/api/service-items`, `/api/transport-items`
- **Quotations**: `/api/service-quotations`, `/api/transport-quotations`, `/api/indent-quotations`
- **Attachments**: `/api/attachments`

### Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example API Calls

```bash
# Get all RFQs
curl -X GET "http://localhost:8000/api/rfq" \
  -H "Authorization: Bearer <token>"

# Create a new RFQ
curl -X POST "http://localhost:8000/api/rfq" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Office Supplies RFQ",
    "description": "Request for office supplies",
    "commodity_type": "INDENT"
  }'
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test categories
pytest tests/test_models.py
pytest tests/test_services.py
pytest tests/test_api_integration.py

# Run test runner script
python tests/run_tests.py
```

### Test Coverage

The test suite provides comprehensive coverage:
- **Models**: 100% coverage of SQLAlchemy models and relationships
- **Services**: Complete business logic testing with error scenarios
- **Controllers**: HTTP request/response handling with mocking
- **API Integration**: End-to-end testing with real HTTP requests
- **Middleware**: Authentication, rate limiting, CORS testing
- **Utils**: Helper functions and validation testing

### Test Categories

- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: Component interaction testing
- **API Tests**: HTTP endpoint testing with real requests
- **Database Tests**: SQLAlchemy model and relationship testing
- **Authentication Tests**: JWT token and user authentication testing
- **File Upload Tests**: File handling and validation testing

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM

## 📊 Database Schema

The application manages the following entities:

- **General_Purchase_RFQ**: Main RFQ records
- **Users**: System users with roles
- **Vendors**: Supplier information
- **Sites**: Company locations
- **Items**: Indent, Service, and Transport items
- **Quotations**: Vendor quotations for items
- **Attachments**: File attachments for RFQs

## 🔧 Development Tools

### Code Validation

```bash
# Validate entire codebase
python scripts/validate_codebase.py

# Check imports and dependencies
python -c "import app; print('All imports successful')"
```

### Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Type checking
mypy .
```

### Automated Deployment

```bash
# Run automated deployment
python scripts/deploy.py

# Validate deployment
python scripts/validate_codebase.py
```

## 🚀 Deployment

### Option 1: Manual Deployment

1. **Set production environment variables**
2. **Use a production ASGI server** (e.g., Gunicorn with Uvicorn workers)
3. **Set up reverse proxy** (e.g., Nginx)
4. **Configure SSL/TLS**
5. **Set up monitoring and logging**

Example production command:
```bash
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build Docker image manually
docker build -t pricing-system-backend .
docker run -p 8000:8000 pricing-system-backend
```

### Option 3: Automated Deployment

```bash
# Run deployment script
python scripts/deploy.py

# Use generated startup script
# Windows: start.bat
# Linux/Mac: ./start.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the test files for usage examples
- Open an issue for bugs or feature requests
