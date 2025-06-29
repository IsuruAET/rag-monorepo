# RAG Frontend Application

A modern React + TypeScript frontend for the RAG (Retrieval-Augmented Generation) application.

## Features

- **Chat Interface**: Interactive chat with the RAG system
- **Document Management**: Add, view, and manage documents
- **Search**: Semantic search through documents
- **Modern UI**: Beautiful, responsive design with gradient themes

## Tech Stack

- React 19
- TypeScript
- Vite
- Axios for API calls
- Modern CSS with gradients and animations

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Integration

The frontend connects to the backend API running on port 5000 through a proxy configuration in `vite.config.ts`. All API calls are routed through `/api/*` and automatically proxied to the backend.

### Available Endpoints

- **Chat**: `POST /api/chat` - Send messages and get AI responses
- **Documents**:
  - `GET /api/documents` - Get all documents
  - `POST /api/documents` - Add a single document
  - `POST /api/documents/bulk` - Add multiple documents
- **Search**: `POST /api/search` - Search documents semantically

## Project Structure

```
src/
├── components/
│   ├── ChatTab.tsx      # Chat interface
│   ├── DocumentsTab.tsx # Document management
│   └── SearchTab.tsx    # Search interface
├── services/
│   └── api.ts          # API service layer
├── App.tsx             # Main application component
├── App.css             # Global styles
└── main.tsx            # Application entry point
```

## Development

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Backend Requirements

Make sure the backend server is running on port 5000 before using the frontend. The backend should have all the required endpoints implemented as defined in the API service.
