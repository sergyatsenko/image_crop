import { useEffect, useMemo, useState } from "react";
import type { ClientSDK } from "@sitecore-marketplace-sdk/client";
import type { MediaSelection } from "../types/crop";
import { searchMedia } from "../utils/mediaSearch";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaSelection) => void;
  client: ClientSDK | null;
  language?: string;
  rootPath?: string;
}

export function MediaSearchModal({ isOpen, onClose, onSelect, client, language, rootPath }: Props) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<MediaSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const path = useMemo(() => rootPath ?? "/sitecore/media library", [rootPath]);
  const lang = useMemo(() => language ?? "en", [language]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = setTimeout(() => {
      void runSearch(query || "*");
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isOpen]);

  const runSearch = async (term: string) => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const media = await searchMedia(client, path, term, lang);
      setResults(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search media");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "min(960px, 100%)", maxHeight: "80vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>Find media</h3>
            <p style={{ margin: "4px 0", color: "#6b7280" }}>Path: {path}</p>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </header>

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <input
            autoFocus
            className="field"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading && <p>Searching media...</p>}
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              style={{
                textAlign: "left",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 10,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "100%",
                  paddingTop: "56%",
                  borderRadius: 10,
                  background: "#f3f4f6",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                {item.mediaUrl ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.name ?? "Media preview"}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ color: "#9ca3af" }}>No preview</span>
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>{item.path}</div>
            </button>
          ))}
        </div>

        {!loading && results.length === 0 && <p style={{ color: "#6b7280" }}>No media found for this term.</p>}
      </div>
    </div>
  );
}
