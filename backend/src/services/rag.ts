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
      // Check if this is a sales-related query
      const salesKeywords = [
        "customer",
        "purchase",
        "sales",
        "buy",
        "product",
        "amount",
        "total",
        "top",
        "revenue",
      ];
      const isSalesQuery = salesKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      );

      if (isSalesQuery) {
        const salesAnswer = await this.querySalesData(message);
        return {
          answer: salesAnswer,
          sources: [],
          messageId: Date.now().toString(),
        };
      }

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

  async querySalesData(query: string): Promise<string> {
    try {
      const db = getDB();

      // Get all sales records
      const salesRecords = await db.collection("sales").find({}).toArray();

      if (salesRecords.length === 0) {
        return "No sales data found in the database. Please ensure sales data has been loaded.";
      }

      // Analyze the query and generate appropriate response
      if (
        query.toLowerCase().includes("top") &&
        query.toLowerCase().includes("customer")
      ) {
        return this.getTopCustomersByPurchaseAmount(salesRecords);
      }

      // Default: return summary of sales data
      return this.getSalesSummary(salesRecords);
    } catch (error) {
      console.error("Error querying sales data:", error);
      throw new Error("Failed to query sales data");
    }
  }

  private getTopCustomersByPurchaseAmount(salesRecords: any[]): string {
    // Group by customer and calculate total purchase amount
    const customerTotals = new Map<
      string,
      { name: string; total: number; products: Set<string> }
    >();

    salesRecords.forEach((record) => {
      const customerId = record.customer.id;
      const customerName = record.customer.name;
      const total = record.total;

      if (!customerTotals.has(customerId)) {
        customerTotals.set(customerId, {
          name: customerName,
          total: 0,
          products: new Set(),
        });
      }

      const customer = customerTotals.get(customerId)!;
      customer.total += total;

      // Add products to the set
      record.items.forEach((item: any) => {
        customer.products.add(item.name);
      });
    });

    // Sort by total purchase amount and get top 3
    const topCustomers = Array.from(customerTotals.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        total: data.total,
        products: Array.from(data.products),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    let response = "Top 3 customers by total purchase amount:\n\n";

    topCustomers.forEach((customer, index) => {
      response += `${index + 1}. ${customer.name}\n`;
      response += `   Total Purchase Amount: $${customer.total.toFixed(2)}\n`;
      response += `   Products Purchased: ${customer.products.join(", ")}\n\n`;
    });

    return response;
  }

  private getSalesSummary(salesRecords: any[]): string {
    const totalRevenue = salesRecords.reduce(
      (sum, record) => sum + record.total,
      0
    );
    const totalOrders = salesRecords.length;
    const uniqueCustomers = new Set(
      salesRecords.map((record) => record.customer.id)
    ).size;

    return (
      `Sales Summary:\n` +
      `- Total Revenue: $${totalRevenue.toFixed(2)}\n` +
      `- Total Orders: ${totalOrders}\n` +
      `- Unique Customers: ${uniqueCustomers}\n\n` +
      `Ask me about top customers, specific products, or any other sales data!`
    );
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
