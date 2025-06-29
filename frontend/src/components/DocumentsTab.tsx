import { useState, useEffect } from "react";
import { documentsAPI } from "../services/api";
import type { Document } from "../services/api";

const DocumentsTab = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newDocument, setNewDocument] = useState({ content: "", metadata: "" });
  const [bulkDocuments, setBulkDocuments] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await documentsAPI.getAll(50);
      setDocuments(response.documents);
    } catch (error) {
      console.error("Failed to load documents:", error);
      setMessage("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.content.trim()) return;

    try {
      const metadata = newDocument.metadata
        ? JSON.parse(newDocument.metadata)
        : undefined;
      await documentsAPI.addDocument(newDocument.content, metadata);
      setNewDocument({ content: "", metadata: "" });
      setMessage("Document added successfully!");
      loadDocuments();
    } catch (error) {
      console.error("Failed to add document:", error);
      setMessage("Failed to add document");
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkDocuments.trim()) return;

    try {
      const docs = bulkDocuments
        .split("\n\n")
        .map((doc) => {
          const lines = doc.split("\n");
          const content = lines[0] || "";
          const metadata = lines[1] ? JSON.parse(lines[1]) : undefined;
          return { content, metadata };
        })
        .filter((doc) => doc.content.trim());

      const response = await documentsAPI.addBulkDocuments(docs);
      setBulkDocuments("");
      setMessage(
        `Bulk add completed: ${response.successful} successful, ${response.failed} failed`
      );
      loadDocuments();
    } catch (error) {
      console.error("Failed to bulk add documents:", error);
      setMessage("Failed to bulk add documents");
    }
  };

  return (
    <div className="documents-container">
      <div className="documents-section">
        <h2>Add New Document</h2>
        <div className="form-group">
          <label>Content:</label>
          <textarea
            value={newDocument.content}
            onChange={(e) =>
              setNewDocument((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Enter document content..."
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Metadata (JSON):</label>
          <textarea
            value={newDocument.metadata}
            onChange={(e) =>
              setNewDocument((prev) => ({ ...prev, metadata: e.target.value }))
            }
            placeholder='{"key": "value"}'
            rows={2}
          />
        </div>
        <button
          onClick={handleAddDocument}
          disabled={!newDocument.content.trim()}
        >
          Add Document
        </button>
      </div>

      <div className="documents-section">
        <h2>Bulk Add Documents</h2>
        <div className="form-group">
          <label>Documents (one per line, metadata on second line):</label>
          <textarea
            value={bulkDocuments}
            onChange={(e) => setBulkDocuments(e.target.value)}
            placeholder="Document content 1&#10;{'key': 'value'}&#10;&#10;Document content 2&#10;{'key': 'value'}"
            rows={8}
          />
        </div>
        <button onClick={handleBulkAdd} disabled={!bulkDocuments.trim()}>
          Bulk Add
        </button>
      </div>

      {message && (
        <div className="message-banner">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="documents-section">
        <h2>All Documents ({documents.length})</h2>
        <button onClick={loadDocuments} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </button>

        <div className="documents-list">
          {documents.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="document-content">{doc.content}</div>
              {doc.metadata && (
                <div className="document-metadata">
                  <strong>Metadata:</strong> {JSON.stringify(doc.metadata)}
                </div>
              )}
              <div className="document-id">ID: {doc.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
