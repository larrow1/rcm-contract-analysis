# RCM Contract Analysis

A web application for healthcare providers to analyze Revenue Cycle Management (RCM) vendor contracts using Claude AI. Upload PDF or DOCX contract documents and automatically extract key information including costs, terms, compliance requirements, and vendor details.

## Project Overview

This application helps healthcare providers efficiently analyze RCM vendor contracts by:
- Uploading contract documents (PDF/DOCX)
- Automatically extracting and parsing document text
- Using Claude AI to identify and structure key contract information
- Storing analysis results for future reference
- Displaying extracted data in an organized, searchable format

## Architecture

**Full-Stack Application:**
- **Backend**: Python + FastAPI (async REST API) ✅
- **Frontend**: React + Vite + Tailwind CSS ✅
- **Database**: SQLite (development) / PostgreSQL (production) ✅
- **AI**: Claude API via Anthropic Python SDK ✅
- **Document Parsing**: pypdf, pdfplumber, python-docx ✅

## Current Status

### ✅ FULLY FUNCTIONAL

The application is now complete and ready to use! All core features have been implemented:

**Backend (Completed):**
- FastAPI REST API with full CRUD operations
- Document parsing (PDF/DOCX) with pypdf, pdfplumber, python-docx
- Claude AI integration for contract analysis
- SQLite database with Alembic migrations
- File upload and storage management
- Background processing for analysis

**Frontend (Completed):**
- Modern React UI with Vite and Tailwind CSS
- Drag-and-drop file upload interface
- Real-time contract list with auto-refresh
- Detailed analysis results view
- Organized display of extracted contract data
- Responsive design

**Features:**
- Upload PDF or DOCX contracts
- Automatic text extraction
- AI-powered analysis extracting:
  - Vendor information
  - Financial terms
  - Service details
  - Contract terms and duration
  - Compliance and legal terms
  - RCM-specific details
- View and manage all analyzed contracts
- Delete contracts
- Re-analyze contracts

## Quick Start

### Running the Application

**Both backend and frontend are currently running!**

#### Backend Server
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

#### Frontend Application
- **URL**: http://localhost:5173
- **Status**: Running with hot-reload

### Quick Start (Fresh Setup)

#### 1. Backend Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Your API key is already configured in backend/.env

# Start the server (if not running)
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start development server (if not running)
npm run dev -- --host 0.0.0.0 --port 5173
```

#### 3. Access the Application

Open your browser and navigate to:
- **Frontend UI**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs

## How to Use

1. **Access the Application**
   - Open http://localhost:5173 in your browser

2. **Upload a Contract**
   - Drag and drop a PDF or DOCX file onto the upload area
   - Or click the upload area to select a file
   - Supported formats: PDF, DOCX (max 50MB)

3. **Monitor Processing**
   - The contract list will show "Processing" status
   - Analysis typically takes 15-30 seconds
   - The page auto-refreshes every 5 seconds during processing

4. **View Analysis Results**
   - Click on a completed contract to view detailed analysis
   - Review extracted information organized by category:
     - Vendor Information
     - Financial Terms
     - Service Details
     - Contract Terms
     - Compliance & Legal
     - RCM-Specific Terms

5. **Manage Contracts**
   - Delete contracts using the trash icon
   - Re-analyze contracts if needed
   - All data is stored in the database for future reference

## Extracted Data Categories

The application will extract the following information from RCM contracts:

1. **Vendor Information** - Name, contact, address, tax ID
2. **Financial Terms** - Contract value, payment terms, pricing model, penalties
3. **Service Details** - Scope, included/excluded services, SLAs, performance metrics
4. **Contract Terms** - Start/end dates, duration, renewal terms, termination clauses
5. **Compliance & Legal** - HIPAA compliance, data security, audit rights, liability, insurance
6. **RCM-Specific** - Billing services, coding, denial management, collection rates, reporting
7. **Additional Notes** - Any other critical terms

## Project Structure

```
rcm-contract-analysis/
├── backend/                    # Python/FastAPI backend ✅
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── config.py          # Settings management
│   │   ├── database.py        # Database connection
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── api/routes/        # API endpoints (to be added)
│   │   ├── services/          # Business logic (to be added)
│   │   └── utils/             # Utilities (to be added)
│   ├── alembic/               # Database migrations
│   ├── venv/                  # Python virtual environment
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment configuration
├── frontend/                   # React frontend (to be implemented)
└── README.md                   # This file
```

## Database Schema

### Users Table
- User authentication and account management

### Contracts Table
- Uploaded contract metadata
- Processing status tracking
- File storage references

### Contract Analysis Table
- Raw extracted text
- Structured Claude analysis results (JSON)
- Token usage tracking

### Extracted Fields Table
- Normalized field storage for querying
- Individual key-value pairs

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info

### Contracts
- `POST /api/contracts/upload` - Upload contract
- `GET /api/contracts` - List contracts (paginated)
- `GET /api/contracts/{id}` - Get contract details
- `DELETE /api/contracts/{id}` - Delete contract

### Analysis
- `POST /api/analysis/analyze/{contract_id}` - Trigger analysis
- `GET /api/analysis/{analysis_id}` - Get analysis results
- `POST /api/analysis/{analysis_id}/reanalyze` - Re-analyze

### Dashboard
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/recent` - Recent uploads

## Development

See `backend/README.md` for detailed backend development instructions.

## Environment Variables

Key environment variables (see `backend/.env.example`):
- `ANTHROPIC_API_KEY` - Your Claude API key (required)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET_KEY` - Secret for JWT tokens
- `MAX_UPLOAD_SIZE_MB` - Max file upload size
- `CORS_ORIGINS` - Allowed frontend origins

## License

This project is for internal use by healthcare providers for RCM contract analysis.

## Support

For questions or issues, refer to the implementation plan or backend documentation.
