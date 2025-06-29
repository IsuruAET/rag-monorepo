import { useState } from "react";
import "./App.css";
import ChatTab from "./components/ChatTab";
import DocumentsTab from "./components/DocumentsTab";
import SearchTab from "./components/SearchTab";

type TabType = "chat" | "documents" | "search";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  return (
    <div className="app">
      <header className="app-header">
        <h1>RAG Application</h1>
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>
          <button
            className={`tab-button ${
              activeTab === "documents" ? "active" : ""
            }`}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
          <button
            className={`tab-button ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            Search
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "search" && <SearchTab />}
      </main>
    </div>
  );
}

export default App;
