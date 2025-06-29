import { Router } from "express";
import { RAGService } from "../services/rag";
import { SearchRequest } from "@rag-monorepo/shared";

const router = Router();
const ragService = new RAGService();

router.post("/", async (req, res) => {
  try {
    const { query, limit = 5 }: SearchRequest = req.body;

    if (!query || typeof query !== "string") {
      return res
        .status(400)
        .json({ error: "Query is required and must be a string" });
    }

    const results = await ragService.searchDocuments(query, limit);
    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export { router as searchRouter };
