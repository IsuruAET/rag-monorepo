import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types from shared package
export interface Document {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

export interface SearchResult {
  document: Document;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  answer: string;
  sources: SearchResult[];
  messageId: string;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

// Chat API
export const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post("/chat", request);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  getAll: async (limit?: number): Promise<{ documents: Document[] }> => {
    const params = limit ? { limit } : {};
    const response = await api.get("/documents", { params });
    return response.data;
  },

  addDocument: async (
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<{ id: string; message: string }> => {
    const response = await api.post("/documents", { content, metadata });
    return response.data;
  },

  addBulkDocuments: async (
    documents: Array<{ content: string; metadata?: Record<string, unknown> }>
  ): Promise<{ message: string; successful: number; failed: number }> => {
    const response = await api.post("/documents/bulk", { documents });
    return response.data;
  },
};

// Search API
export const searchAPI = {
  search: async (
    request: SearchRequest
  ): Promise<{ results: SearchResult[] }> => {
    const response = await api.post("/search", request);
    return response.data;
  },
};
