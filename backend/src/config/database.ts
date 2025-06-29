import { MongoClient, Db } from "mongodb";

let db: Db;
let client: MongoClient;

export async function connectDB(): Promise<void> {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/rag-database";
    client = new MongoClient(uri);

    await client.connect();
    db = client.db();

    console.log("✅ Connected to MongoDB");

    // Create indexes for better performance
    await db.collection("documents").createIndex({ content: "text" });
    await db.collection("documents").createIndex({ embedding: "2dsphere" });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});
