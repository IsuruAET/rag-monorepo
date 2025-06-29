import { useState } from "react";
import { searchAPI } from "../services/api";
import type { SearchResult } from "../services/api";

const SearchTab = () => {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await searchAPI.search({ query: query.trim(), limit });
      setResults(response.results);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-form">
        <h2>Search Documents</h2>
        <div className="form-group">
          <label>Query:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query..."
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Limit:</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
            min="1"
            max="20"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="search-results">
        <h3>Results ({results.length})</h3>
        {results.length === 0 && !isLoading && query && (
          <p>No results found for "{query}"</p>
        )}

        <div className="results-list">
          {results.map((result, index) => (
            <div key={result.document.id} className="result-item">
              <div className="result-header">
                <span className="result-score">
                  Score: {result.score.toFixed(4)}
                </span>
                <span className="result-rank">#{index + 1}</span>
              </div>
              <div className="result-content">{result.document.content}</div>
              {result.document.metadata && (
                <div className="result-metadata">
                  <strong>Metadata:</strong>{" "}
                  {JSON.stringify(result.document.metadata)}
                </div>
              )}
              <div className="result-id">ID: {result.document.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchTab;
