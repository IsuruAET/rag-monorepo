import OpenAI from "openai";
import { Document } from "@rag-monorepo/shared";

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "⚠️  OPENAI_API_KEY not found. Please set it in your .env file."
  );
  console.warn("   You can get one from: https://platform.openai.com/api-keys");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export class OpenAIService {
  private model = "text-embedding-ada-002";
  private chatModel = "gpt-3.5-turbo";

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.model,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error getting embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  async getChatCompletion(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    context?: string
  ): Promise<string> {
    try {
      const systemMessage = context
        ? `You are a helpful assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so. Context: ${context}`
        : "You are a helpful assistant.";

      const response = await openai.chat.completions.create({
        model: this.chatModel,
        messages: [{ role: "system", content: systemMessage }, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "No response generated";
    } catch (error) {
      console.error("Error getting chat completion:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  async getEmbeddingsForDocuments(documents: Document[]): Promise<Document[]> {
    const documentsWithEmbeddings = await Promise.all(
      documents.map(async (doc) => {
        try {
          const embedding = await this.getEmbedding(doc.content);
          return { ...doc, embedding };
        } catch (error) {
          console.error(
            `Failed to get embedding for document ${doc.id}:`,
            error
          );
          return doc;
        }
      })
    );

    return documentsWithEmbeddings;
  }
}
