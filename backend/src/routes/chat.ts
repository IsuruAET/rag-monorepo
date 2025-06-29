import { Router } from "express";
import { RAGService } from "../services/rag";
import { ChatRequest } from "@rag-monorepo/shared";

const router = Router();
const ragService = new RAGService();

router.post("/", async (req, res) => {
  try {
    const { message, history = [] }: ChatRequest = req.body;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "Message is required and must be a string" });
    }

    const response = await ragService.chat(message, history);
    res.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

export { router as chatRouter };
