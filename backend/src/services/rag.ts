import { getDB } from "../config/database";
import { OpenAIService } from "./openai";
import {
  Document,
  SearchResult,
  ChatMessage,
  ChatResponse,
} from "@rag-monorepo/shared";

export class RAGService {
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async searchDocuments(
    query: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      const db = getDB();
      const queryEmbedding = await this.openaiService.getEmbedding(query);

      // Simple vector similarity search using cosine similarity
      const documents = await db
        .collection("documents")
        .find({ embedding: { $exists: true } })
        .toArray();

      const results: SearchResult[] = [];

      for (const doc of documents) {
        if (doc.embedding) {
          const similarity = this.cosineSimilarity(
            queryEmbedding,
            doc.embedding
          );
          results.push({
            document: {
              id: doc._id.toString(),
              content: doc.content,
              metadata: doc.metadata,
              embedding: doc.embedding,
            },
            score: similarity,
          });
        }
      }

      // Sort by similarity score and return top results
      return results.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error("Error searching documents:", error);
      throw new Error("Failed to search documents");
    }
  }

  async chat(
    message: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      // Search for relevant documents
      const searchResults = await this.searchDocuments(message, 3);

      // Create context from search results
      const context = searchResults
        .map((result) => result.document.content)
        .join("\n\n");

      // Prepare chat history
      const messages = history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Add current message
      messages.push({ role: "user", content: message });

      // Get AI response
      const answer = await this.openaiService.getChatCompletion(
        messages,
        context
      );

      const response: ChatResponse = {
        answer,
        sources: searchResults,
        messageId: Date.now().toString(),
      };

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      throw new Error("Failed to process chat message");
    }
  }

  async addDocument(
    content: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const db = getDB();

      // Generate embedding
      const embedding = await this.openaiService.getEmbedding(content);

      const document = {
        content,
        metadata,
        embedding,
        createdAt: new Date(),
      };

      const result = await db.collection("documents").insertOne(document);
      return result.insertedId.toString();
    } catch (error) {
      console.error("Error adding document:", error);
      throw new Error("Failed to add document");
    }
  }

  async getDocuments(limit: number = 50): Promise<Document[]> {
    try {
      const db = getDB();
      const documents = await db
        .collection("documents")
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return documents.map((doc) => ({
        id: doc._id.toString(),
        content: doc.content,
        metadata: doc.metadata,
        embedding: doc.embedding,
      }));
    } catch (error) {
      console.error("Error getting documents:", error);
      throw new Error("Failed to get documents");
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
