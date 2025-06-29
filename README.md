# RAG Monorepo

A Retrieval-Augmented Generation (RAG) application with a Node.js backend and React frontend.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Project Structure

```
rag-monorepo/
├── backend/          # Node.js API server
├── frontend/         # React application
└── shared/           # Shared utilities
```

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd rag-monorepo

# Install root dependencies
npm install

# Install shared dependencies
cd shared
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Build Shared Package

The shared package contains TypeScript interfaces used by the backend and needs to be built first:

```bash
cd shared
npm run build
```

### 3. Environment Setup

#### Backend Environment

```bash
cd backend
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Database configuration
DATABASE_URL=your_database_url_here

# OpenAI configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Server configuration
PORT=3001
NODE_ENV=development
```

#### Frontend Environment

The frontend will automatically connect to the backend on `http://localhost:3001`.

### 4. Database Setup

Ensure your database is running and accessible. Update the `DATABASE_URL` in your backend `.env` file.

### 5. Start the Application

#### Option A: Run Separately

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend (in a new terminal):**

```bash
cd frontend
npm run dev
```

#### Option B: Run from Root (if scripts are configured)

```bash
# From root directory
npm run dev:backend
npm run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Available Scripts

### Shared Scripts

```bash
cd shared
npm run build        # Build TypeScript to JavaScript
npm run dev          # Build in watch mode
```

### Backend Scripts

```bash
cd backend
npm run dev          # Start development server with nodemon (auto-builds shared)
npm run build        # Build shared + backend for production
npm start           # Start production server
```

### Frontend Scripts

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## API Endpoints

The backend provides the following endpoints:

- `POST /api/chat` - Chat with RAG system
- `POST /api/documents` - Upload documents
- `GET /api/search` - Search documents

## Features

- **Chat Interface**: Interactive chat with RAG-powered responses
- **Document Management**: Upload and manage documents for retrieval
- **Search**: Search through uploaded documents
- **Real-time Updates**: Live updates for chat and document operations

## Development

### Adding New Features

1. Backend changes go in `backend/src/`
2. Frontend changes go in `frontend/src/`
3. Shared utilities go in `shared/src/`

### Code Style

- Backend uses TypeScript with ESLint
- Frontend uses React with TypeScript and ESLint
- Follow existing code patterns and conventions

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in the respective `.env` file or kill the process using the port
2. **Database connection failed**: Check your `DATABASE_URL` and ensure the database is running
3. **OpenAI API errors**: Verify your API key is correct and has sufficient credits

### Logs

- Backend logs appear in the terminal where you started the backend
- Frontend logs appear in the browser console and terminal

## Production Deployment

1. Build the frontend: `cd frontend && npm run build`
2. Build the backend: `cd backend && npm run build`
3. Set `NODE_ENV=production` in your environment
4. Deploy according to your hosting platform's requirements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]
