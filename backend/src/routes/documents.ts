import { Router } from "express";
import { RAGService } from "../services/rag";

const router = Router();
const ragService = new RAGService();

// Get all documents
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const documents = await ragService.getDocuments(limit);
    res.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to get documents" });
  }
});

// Add a new document
router.post("/", async (req, res) => {
  try {
    const { content, metadata } = req.body;

    if (!content || typeof content !== "string") {
      return res
        .status(400)
        .json({ error: "Content is required and must be a string" });
    }

    const documentId = await ragService.addDocument(content, metadata);
    res
      .status(201)
      .json({ id: documentId, message: "Document added successfully" });
  } catch (error) {
    console.error("Add document error:", error);
    res.status(500).json({ error: "Failed to add document" });
  }
});

// Bulk add documents
router.post("/bulk", async (req, res) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: "Documents must be an array" });
    }

    const results = await Promise.allSettled(
      documents.map((doc) => ragService.addDocument(doc.content, doc.metadata))
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.length - successful;

    res.status(201).json({
      message: `Added ${successful} documents, ${failed} failed`,
      successful,
      failed,
    });
  } catch (error) {
    console.error("Bulk add documents error:", error);
    res.status(500).json({ error: "Failed to add documents" });
  }
});

export { router as documentsRouter };
