import { useEffect, useMemo, useRef, useState } from "react";

export type ReassignAgent = { id: string; name: string };

type Props = {
  agents: ReassignAgent[];
  defaultSelectedId?: string;
  onCancel: () => void;
  onSave: (agent: ReassignAgent) => void;
};

const BADGE_COLORS = [
  "#e8233f",
  "#2e9e5b",
  "#3b7fd4",
  "#6b5bd2",
  "#0a8f8f",
  "#d9772b",
  "#c0399b",
  "#5a8f1f",
];

function initialsOf(name: string): string {
  const words = name
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0] ?? "";
  const second = words.length > 1 ? words[1][0] ?? "" : "";
  return (first + second).toUpperCase();
}

function colorOf(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BADGE_COLORS[h % BADGE_COLORS.length];
}

function AgentBadge({ name, id }: ReassignAgent) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: colorOf(id),
        color: "#fff",
        fontWeight: 700,
        fontSize: 10,
        lineHeight: 1,
        letterSpacing: 0.3,
        borderRadius: 999,
        padding: "3px 6px",
        minWidth: 22,
        textAlign: "center",
        flex: "0 0 auto",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

export function ReassignConversationModal({
  agents,
  defaultSelectedId,
  onCancel,
  onSave,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId ?? agents[0]?.id ?? "",
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = agents.find((a) => a.id === selectedId) ?? agents[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => a.name.toLowerCase().includes(q));
  }, [agents, query]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (open) setOpen(false);
        else onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Lato', sans-serif",
      }}
      data-testid="overlay-reassign"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxWidth: "calc(100vw - 32px)",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          padding: "22px 24px 24px",
          boxSizing: "border-box",
        }}
        data-testid="modal-reassign"
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#2b2b2b",
              lineHeight: 1.2,
            }}
            data-testid="text-reassign-title"
          >
            Reassign conversation
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            data-testid="button-reassign-close"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#9aa0a6",
              lineHeight: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div style={{ marginTop: 18 }} ref={rootRef}>
          <div
            style={{
              fontSize: 12,
              color: "#8a8a8a",
              marginBottom: 6,
            }}
          >
            Agent
          </div>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              data-testid="button-reassign-dropdown"
              style={{
                width: "100%",
                height: 38,
                border: "1px solid #d2d6da",
                borderRadius: 6,
                background: "#fff",
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
              >
                {selected && <AgentBadge id={selected.id} name={selected.name} />}
                <span
                  style={{
                    fontSize: 14,
                    color: "#1a1a1a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  data-testid="text-selected-agent"
                >
                  {selected?.name ?? "Select an agent"}
                </span>
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  flex: "0 0 auto",
                  color: "#5a6168",
                  transform: open ? "rotate(180deg)" : "none",
                  transition: "transform 120ms",
                }}
              >
                <path
                  d="M3 6l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% - 2px)",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #d2d6da",
                  borderTop: "none",
                  borderRadius: "0 0 6px 6px",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
                  zIndex: 5,
                  padding: 8,
                  boxSizing: "border-box",
                }}
                data-testid="dropdown-reassign-list"
              >
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  data-testid="input-reassign-search"
                  style={{
                    width: "100%",
                    height: 34,
                    border: "1px solid #2b7fc4",
                    borderRadius: 6,
                    padding: "0 12px",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 6,
                  }}
                />
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {filtered.length === 0 && (
                    <div
                      style={{
                        padding: "12px",
                        color: "#8a8a8a",
                        fontSize: 13,
                      }}
                    >
                      No agents found
                    </div>
                  )}
                  {filtered.map((a) => {
                    const isSel = a.id === selectedId;
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => {
                          setSelectedId(a.id);
                          setOpen(false);
                          setQuery("");
                        }}
                        data-testid={`option-agent-${a.id}`}
                        style={{
                          width: "100%",
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "0 12px",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          textAlign: "left",
                          background: isSel ? "#1565c0" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel)
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "#f1f3f5";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel)
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "transparent";
                        }}
                      >
                        <AgentBadge id={a.id} name={a.name} />
                        <span
                          style={{
                            fontSize: 14,
                            color: isSel ? "#fff" : "#1a1a1a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {a.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 24,
          }}
        >
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSave(selected)}
            data-testid="button-reassign-save"
            style={{
              height: 40,
              padding: "0 28px",
              background: selected ? "#0b6cb1" : "#9bbdd6",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              borderRadius: 4,
              cursor: selected ? "pointer" : "not-allowed",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReassignConversationModal;
