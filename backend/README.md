# RCM Contract Analysis - Backend

Python/FastAPI backend for analyzing RCM (Revenue Cycle Management) vendor contracts using Claude AI.

## What's Been Built (Phase 1 - Backend Foundation)

The backend application framework has been successfully set up with the following components:

### Core Files
- **app/main.py** - FastAPI application entry point with middleware, error handling, and health checks
- **app/config.py** - Configuration management using Pydantic Settings (loads from .env)
- **app/database.py** - SQLAlchemy database connection and session management
- **app/models.py** - Database models (User, Contract, ContractAnalysis, ExtractedField)
- **app/schemas.py** - Pydantic schemas for request/response validation

### Database
- SQLite database configured (can be switched to PostgreSQL for production)
- Alembic migrations set up for database version control
- Initial migration created with all tables:
  - `users` - User authentication
  - `contracts` - Uploaded contract metadata
  - `contract_analysis` - Claude analysis results
  - `extracted_fields` - Normalized field storage

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Settings management
│   ├── database.py             # DB connection
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── api/routes/             # API endpoints (to be added)
│   ├── services/               # Business logic (to be added)
│   └── utils/                  # Utilities (to be added)
├── alembic/                    # Database migrations
├── venv/                       # Python virtual environment
├── requirements.txt            # Dependencies
├── .env                        # Environment variables
└── .env.example                # Example environment config
```

## Setup Instructions

### 1. Configure Environment Variables

Edit `backend/.env` and set your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your-actual-api-key-here
```

### 2. Activate Virtual Environment

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Run Database Migrations (Already Done)

```bash
./venv/bin/alembic upgrade head
```

### 4. Start the Server

```bash
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or run directly:
```bash
python -m uvicorn app.main:app --reload
```

### 5. Access the API

- **API Root**: http://localhost:8000/
- **Health Check**: http://localhost:8000/health
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc

## Available Endpoints (Currently)

- `GET /` - Root endpoint with API info
- `GET /health` - Health check

## Next Steps (Phases 2-9)

The following phases need to be implemented:

1. **Phase 2: Authentication** - JWT-based auth system
2. **Phase 3: Document Processing** - PDF/DOCX parsing services
3. **Phase 4: Claude API Integration** - Contract analysis with Claude
4. **Phase 5: Contract API Endpoints** - Upload, list, retrieve contracts
5. **Phase 6: Frontend Setup** - React + Vite + Tailwind CSS
6. **Phase 7: Frontend Features** - Upload UI, contract list, detail views
7. **Phase 8: Testing & Refinement** - Unit tests, integration tests
8. **Phase 9: Deployment Preparation** - Docker, docs, production config

## Database Management

### Create a New Migration
```bash
./venv/bin/alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations
```bash
./venv/bin/alembic upgrade head
```

### Rollback Migration
```bash
./venv/bin/alembic downgrade -1
```

### View Migration History
```bash
./venv/bin/alembic history
```

## Development

The server runs in reload mode for development, automatically restarting when code changes are detected.

Logs are output to the console showing:
- Request processing times
- SQL queries (in debug mode)
- Error traces

## Testing

Run tests (once test suite is implemented):
```bash
pytest
```

## Dependencies

See `requirements.txt` for full list. Key dependencies:
- FastAPI - Web framework
- Uvicorn - ASGI server
- SQLAlchemy - ORM
- Alembic - Database migrations
- Pydantic - Data validation
- Anthropic - Claude API client
- pypdf, pdfplumber, python-docx - Document parsing
- python-jose - JWT tokens
- passlib - Password hashing
