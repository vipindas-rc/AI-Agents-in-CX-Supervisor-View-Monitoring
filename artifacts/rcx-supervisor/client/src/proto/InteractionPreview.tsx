import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Headset,
  Mail,
  Maximize2,
  MessageSquareMore,
  Mic,
  MoreVertical,
  NotebookPen,
  PanelRightClose,
  Paperclip,
  PhoneIncoming,
  PhoneOutgoing,
  RefreshCw,
  Send,
  Smile,
  Sparkles,
  StickyNote,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";
import { Tooltip } from "@ringcx/ui";

import { TypeIcon } from "./eag/containers/Chat/TypeIcon";
import { SupervisorFilter } from "./SupervisorFilter";
import type {
  InsightNoteSection,
  InteractionPreviewData,
  PreviewHistoryEntry,
  PreviewMessage,
} from "./mock/supervisorMock";
import {
  INSIGHT_NOTES,
  INSIGHT_NOTES_UPDATED_AT,
} from "./mock/supervisorMock";

export type InteractionPreviewMode = "preview" | "expanded" | "takeover";

const RC_BLUE = "#066fac";
const FONT = "'Roboto', sans-serif";

// ---------------------------------------------------------------------------
// Transfer Message Dialog (Figma node 88-27901)
// ---------------------------------------------------------------------------

const MOCK_QUEUES = [
  "Billing Support",
  "Technical Support",
  "Sales",
  "General Inquiries",
  "Returns & Refunds",
];

const MOCK_SKILLS = [
  "English",
  "Spanish",
  "Billing Expert",
  "Tier 2",
  "VIP",
];

const MOCK_AGENTS = [
  "Alice Martinez",
  "Ben Thompson",
  "Clara Singh",
  "David Lee",
  "Eva Novak",
];

type TransferTab = "queue" | "agent";

function TransferMessageDialog({
  onCancel,
  onTransfer,
}: {
  onCancel: () => void;
  onTransfer: (summary: string) => void;
}) {
  const [tab, setTab] = useState<TransferTab>("queue");
  const [selectedQueues, setSelectedQueues] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const canTransfer =
    tab === "queue" ? selectedQueues.length > 0 : selectedAgents.length > 0;

  const handleTransfer = () => {
    const summary =
      tab === "queue"
        ? `Transferred to queue: ${selectedQueues.join(", ")}`
        : `Transferred to agent: ${selectedAgents.join(", ")}`;
    onTransfer(summary);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 44,
    padding: "0 16px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? RC_BLUE : "#757575",
    whiteSpace: "nowrap",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
      data-testid="overlay-transfer-message"
    >
      <div
        style={{
          width: 400,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="dialog-transfer-message"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: "#121212" }}>
            Transfer message
          </span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#616161",
              borderRadius: 4,
            }}
            data-testid="button-transfer-dialog-close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0" }}>
          <button
            type="button"
            style={tabStyle(tab === "queue")}
            onClick={() => setTab("queue")}
            data-testid="tab-transfer-by-queue"
          >
            By queue
            {tab === "queue" && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  background: RC_BLUE,
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
          </button>
          <button
            type="button"
            style={tabStyle(tab === "agent")}
            onClick={() => setTab("agent")}
            data-testid="tab-transfer-by-agent"
          >
            By agent
            {tab === "agent" && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  background: RC_BLUE,
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
          {tab === "queue" ? (
            <>
              {/* Queue multi-select — same Filter/MultiSelect as filter dropdowns.
                  zIndex keeps its open menu above the Skills field below it. */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", zIndex: 2 }}>
                <label style={{ fontFamily: FONT, fontSize: 13, color: "#757575" }}>
                  Queue
                </label>
                <div data-testid="dropdown-queue-search">
                  <SupervisorFilter
                    placeholder="Select a queue..."
                    options={MOCK_QUEUES.map((q) => ({ value: q, label: q }))}
                    values={selectedQueues}
                    onValuesChange={setSelectedQueues}
                    ariaLabel="Queue"
                  />
                </div>
              </div>

              {/* Requeue Skills multi-select — uses the same Filter/MultiSelect as filter dropdowns */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", zIndex: 1 }}>
                <label style={{ fontFamily: FONT, fontSize: 13, color: "#757575" }}>
                  Requeue Skills
                </label>
                <div data-testid="dropdown-requeue-skills">
                  <SupervisorFilter
                    placeholder="Select skills..."
                    options={MOCK_SKILLS.map((s) => ({ value: s, label: s }))}
                    values={selectedSkills}
                    onValuesChange={setSelectedSkills}
                    disabled={selectedQueues.length === 0}
                    ariaLabel="Requeue Skills"
                  />
                </div>
              </div>
            </>
          ) : (
            /* By agent tab */
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontFamily: FONT, fontSize: 13, color: "#757575" }}>
                Agent
              </label>
              <div data-testid="dropdown-agent-select">
                <SupervisorFilter
                  placeholder="Select an agent..."
                  options={MOCK_AGENTS.map((a) => ({ value: a, label: a }))}
                  values={selectedAgents}
                  onValuesChange={setSelectedAgents}
                  ariaLabel="Agent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            padding: "14px 20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 500,
              color: RC_BLUE,
              padding: "0 8px",
            }}
            data-testid="button-transfer-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={canTransfer ? handleTransfer : undefined}
            disabled={!canTransfer}
            style={{
              height: 36,
              padding: "0 20px",
              borderRadius: 4,
              border: "none",
              background: canTransfer ? RC_BLUE : "#e0e0e0",
              color: canTransfer ? "#fff" : "#9e9e9e",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 500,
              cursor: canTransfer ? "pointer" : "not-allowed",
            }}
            data-testid="button-transfer-confirm"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Makes the floating preview popup draggable by its header. Returns the
 * current translate offset and a pointerdown handler for the drag handle —
 * same pattern as the monitoring dialpad's title bar.
 */
function useDragPosition() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  const onDragPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    // Don't hijack clicks on header buttons (expand / close).
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      setOffset({
        x: d.baseX + (ev.clientX - d.startX),
        y: d.baseY + (ev.clientY - d.startY),
      });
    };
    const onUp = (ev: PointerEvent) => {
      if (drag.current?.pointerId !== ev.pointerId) return;
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return { offset, onDragPointerDown };
}

// ---------------------------------------------------------------------------
// Small shared pieces
// ---------------------------------------------------------------------------

function NameBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 16,
        padding: "0 5px",
        borderRadius: 8,
        background: "#3f65a6",
        color: "#fff",
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: 0.3,
        fontFamily: FONT,
      }}
    >
      {label}
    </span>
  );
}

function Avatar({ kind }: { kind: "customer" | "agent" | "supervisor" }) {
  const bg =
    kind === "customer"
      ? "linear-gradient(180deg, #8a8a8a 0%, #5f5f5f 100%)"
      : kind === "supervisor"
        ? "#7a4fb0"
        : "#2073a0";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: bg,
        flexShrink: 0,
      }}
    />
  );
}

// One transcript entry: SYSTEM line, or a customer / agent / supervisor bubble.
function TranscriptMessage({ m }: { m: PreviewMessage }) {
  if (m.who === "system") {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#757575",
          fontFamily: FONT,
          letterSpacing: 0.4,
          margin: "4px 0",
        }}
        data-testid="text-transcript-system"
      >
        {m.text}
      </p>
    );
  }

  const isCustomer = m.who === "customer";
  const bubbleStyle: React.CSSProperties = isCustomer
    ? {
        background: "#f9f9f9",
        border: "1px solid #d1d1d1",
      }
    : {
        background: "#e6f2f8",
        border: "1px solid transparent",
      };
  const editedEl = m.edited ? (
    <span
      style={{
        fontSize: 12,
        color: "#757575",
        fontFamily: FONT,
        letterSpacing: 0.4,
      }}
    >
      (Edited)
    </span>
  ) : null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        justifyContent: isCustomer ? "flex-start" : "flex-end",
      }}
      data-testid={`row-message-${m.who}`}
    >
      {isCustomer && <Avatar kind="customer" />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isCustomer ? "flex-start" : "flex-end",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            ...bubbleStyle,
            borderRadius: 10,
            padding: "10px 12px",
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span
              style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}
            >
              {m.name}
            </span>
            {m.badge ? <NameBadge label={m.badge} /> : null}
          </div>
          <div style={{ fontSize: 14, color: "#121212", lineHeight: "20px" }}>
            {m.text}
            {m.edited && m.editedInline ? <> {editedEl}</> : null}
          </div>
          {m.edited && !m.editedInline ? (
            <div style={{ marginTop: 2 }}>{editedEl}</div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
            fontSize: 12,
            color: "#757575",
            fontFamily: FONT,
            letterSpacing: 0.4,
          }}
        >
          <span>{m.time}</span>
          {m.lang ? (
            <>
              <span>•</span>
              <span>{m.lang}</span>
            </>
          ) : null}
          {m.liked ? (
            <>
              <span>•</span>
              <ThumbsUp size={13} strokeWidth={1.8} />
            </>
          ) : null}
        </div>
      </div>
      {!isCustomer && (
        <Avatar kind={m.who === "supervisor" ? "supervisor" : "agent"} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right pane: Contact info
// ---------------------------------------------------------------------------

const historyIconFor = (icon: PreviewHistoryEntry["icon"]) => {
  const common = { size: 18, strokeWidth: 1.8, color: "#616161" } as const;
  switch (icon) {
    case "call-in":
      return <PhoneIncoming {...common} />;
    case "email":
      return <Mail {...common} />;
    case "postcard":
      return <MessageSquareMore {...common} />;
    case "call-out":
      return <PhoneOutgoing {...common} />;
  }
};

function HistoryEntry({
  entry,
  isLast,
}: {
  entry: PreviewHistoryEntry;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        paddingBottom: 16,
        borderBottom: isLast ? "none" : "1px solid #e5e5e5",
        marginBottom: isLast ? 0 : 16,
      }}
      data-testid="row-history-entry"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        {historyIconFor(entry.icon)}
        <div
          style={{
            width: 1.35,
            flex: 1,
            background: "#c5c7cd",
            minHeight: 12,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: FONT,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#121212" }}>
          {entry.title}
        </span>
        {entry.summary ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Sparkles
              size={16}
              strokeWidth={1.8}
              color="#616161"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <p
              style={{
                fontSize: 14,
                color: "#121212",
                lineHeight: "20px",
                margin: 0,
              }}
            >
              {entry.summary}
              {entry.showMore ? (
                <>
                  {" "}
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      color: RC_BLUE,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                    data-testid="button-show-more"
                  >
                    Show more
                  </button>
                </>
              ) : null}
            </p>
          </div>
        ) : null}
        {entry.note ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StickyNote
              size={16}
              strokeWidth={1.8}
              color="#616161"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{ fontSize: 14, fontStyle: "italic", color: "#616161" }}
            >
              {entry.note}
            </span>
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            gap: 10,
            fontSize: 12,
            color: "#757575",
            letterSpacing: 0.4,
          }}
        >
          <span>{entry.date}</span>
          <span style={{ fontStyle: "italic" }}>{entry.duration}</span>
        </div>
      </div>
    </div>
  );
}

type ContactInfoTab = "contact" | "notes" | "context";

// Runtime hop-log additions: appended when the supervisor takes over ("you")
// or transfers the interaction to a queue / agent. Owned by the parent panel
// so the log survives preview <-> take-over remounts.
export interface ContextHopEvent {
  kind: "you" | "queue" | "agent";
  name?: string;
  atMs: number;
}

// The running hop's start time must survive remounts (preview popup ->
// embedded take-over view), so it's anchored per engagement at module level.
const hopAnchors = new Map<string, number>();
const hopAnchorFor = (engagementId: string): number => {
  let anchor = hopAnchors.get(engagementId);
  if (anchor === undefined) {
    anchor = Date.now();
    hopAnchors.set(engagementId, anchor);
  }
  return anchor;
};

// "1m 48s" / "45s" style duration label.
const hopDuration = (totalSec: number): string => {
  const sec = Math.max(0, Math.round(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
};

const contextCardStyle: React.CSSProperties = {
  background: "#f4f5f7",
  borderRadius: 12,
  padding: 16,
  fontFamily: FONT,
};

const contextPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  background: "#fff",
  border: "1px solid #e4e6ea",
  borderRadius: 16,
  padding: "5px 12px",
  fontSize: 13,
  color: "#121212",
  whiteSpace: "nowrap",
};

const contextCardTitle = (title: string) => (
  <div
    style={{
      fontSize: 13,
      fontWeight: 700,
      color: "#121212",
      marginBottom: 12,
    }}
  >
    {title}
  </div>
);

// The four-card Context view (Figma node 88-63593): caller identity, per-hop
// conversation summaries with Read more, the live hop-log chip chain, and
// interaction-data chips.
export function ContextTabContent({
  data,
  extraHops,
}: {
  data: InteractionPreviewData;
  extraHops: ContextHopEvent[];
}) {
  const ctx = data.context;
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Tick every second so the running hop's duration counts up live.
  const [now, setNow] = useState(() => Date.now());
  const hasRunningHop =
    ctx.hops.some((h) => h.durationSec === undefined) && extraHops.length === 0;
  useEffect(() => {
    if (!hasRunningHop) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasRunningHop]);

  // The running seed hop starts `currentHopStartedSecAgo` before the anchor
  // (first time this engagement's context was rendered). The first runtime
  // event (take over / transfer) closes it with its duration at that moment.
  const anchor = hopAnchorFor(data.engagementId);
  const runningStartMs = anchor - ctx.currentHopStartedSecAgo * 1000;
  const closedAtMs = extraHops.length > 0 ? extraHops[0]!.atMs : null;

  const hopChips: string[] = ctx.hops.map((hop) => {
    if (hop.durationSec !== undefined) {
      return `${hop.label} • ${hopDuration(hop.durationSec)}`;
    }
    const endMs = closedAtMs ?? now;
    return `${hop.label} • ${hopDuration((endMs - runningStartMs) / 1000)}`;
  });
  extraHops.forEach((event) => {
    if (event.kind === "you") hopChips.push("You");
    else if (event.kind === "queue") hopChips.push(`Queue - ${event.name}`);
    else hopChips.push(`Agent - ${event.name}`);
  });

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: FONT,
      }}
      data-testid="contact-pane-context"
    >
      {/* Caller identity */}
      <div style={contextCardStyle} data-testid="context-card-caller">
        {contextCardTitle("Caller identity")}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserRound size={20} strokeWidth={1.8} color="#9aa0a6" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}
              data-testid="context-caller-name"
            >
              {data.contactName}
            </span>
            <span style={{ fontSize: 13, color: "#72757a" }}>
              {data.contactPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Conversation summary */}
      <div style={contextCardStyle} data-testid="context-card-summary">
        {contextCardTitle("Conversation summary")}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ctx.summaries.map((entry, i) => {
            const isOpen = Boolean(expanded[i]);
            return (
              <div key={i} data-testid={`context-summary-${i}`}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {entry.kind === "ai" ? (
                      <Bot size={18} strokeWidth={1.8} color="#616161" />
                    ) : (
                      <Headset size={18} strokeWidth={1.8} color="#616161" />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#121212",
                      }}
                    >
                      {entry.name}
                    </span>
                    <span style={{ fontSize: 12, color: "#72757a" }}>
                      {entry.role}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    lineHeight: "19px",
                    color: "#3c4043",
                    ...(isOpen
                      ? null
                      : {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }),
                  }}
                >
                  {entry.text}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                  style={{
                    appearance: "none",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    marginTop: 2,
                    color: RC_BLUE,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                  data-testid={`context-summary-toggle-${i}`}
                >
                  {isOpen ? "Show less" : "Read more"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hop log */}
      <div style={contextCardStyle} data-testid="context-card-hops">
        {contextCardTitle("Hop log")}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            rowGap: 10,
          }}
        >
          {hopChips.map((label, i) => (
            <span
              key={i}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span style={contextPillStyle} data-testid={`context-hop-${i}`}>
                {label}
              </span>
              {i < hopChips.length - 1 ? (
                <ChevronRight size={14} strokeWidth={2} color="#9aa0a6" />
              ) : null}
            </span>
          ))}
        </div>
      </div>

      {/* Interaction data */}
      <div style={contextCardStyle} data-testid="context-card-data">
        {contextCardTitle("Interaction data")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ctx.dataChips.map((chip) => (
            <span key={chip} style={contextPillStyle}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Shared "Contact info" tab body: the Interaction / contact / history section
// rows plus the scrolling history feed. Exported so voice surfaces (the
// monitoring call window) can render the exact same contact info layout as
// the digital interaction preview.
export function ContactInfoSections({ data }: { data: InteractionPreviewData }) {
  const sectionRow = (
    title: string,
    subtitle: string,
    opts: { menu?: boolean; chevron: "down" | "up" },
    testId: string,
  ) => (
    <div
      style={{
        minHeight: 67,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid rgba(221,223,229,0.5)",
        fontFamily: FONT,
        flexShrink: 0,
      }}
      data-testid={testId}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#121212" }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: "#72757a" }}>{subtitle}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {opts.menu ? (
          <MoreVertical size={18} strokeWidth={1.8} color="#616161" />
        ) : null}
        {opts.chevron === "down" ? (
          <ChevronDown size={18} strokeWidth={1.8} color="#616161" />
        ) : (
          <ChevronUp size={18} strokeWidth={1.8} color="#616161" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {sectionRow(
        "Interaction",
        `Queue: ${data.queueName}`,
        { menu: true, chevron: "down" },
        "section-interaction",
      )}
      {sectionRow(
        data.contactName,
        data.contactPhone,
        { menu: true, chevron: "down" },
        "section-contact",
      )}
      {sectionRow(
        "Interaction history",
        data.historyCountLabel,
        { chevron: "up" },
        "section-history",
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "16px 16px 0",
        }}
      >
        {data.history.map((entry, i) => (
          <HistoryEntry
            key={`${entry.date}-${i}`}
            entry={entry}
            isLast={i === data.history.length - 1}
          />
        ))}
      </div>
    </>
  );
}

function ContactInfoPane({
  data,
  trailing,
  contextHops = [],
}: {
  data: InteractionPreviewData;
  // Header action rendered top-right (the close X per Figma, or a collapse
  // affordance in the embedded take-over view).
  trailing?: React.ReactNode;
  contextHops?: ContextHopEvent[];
}) {
  const [activeTab, setActiveTab] = useState<ContactInfoTab>("contact");

  // Opening a different interaction resets the pane to its default tab so
  // stale tab state never carries across interactions.
  const engagementRef = useRef(data.engagementId);
  useEffect(() => {
    if (engagementRef.current !== data.engagementId) {
      engagementRef.current = data.engagementId;
      setActiveTab("contact");
    }
  }, [data.engagementId]);

  return (
    <div
      style={{
        width: 430,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid rgba(0,0,0,0.1)",
        background: "#fff",
        minHeight: 0,
      }}
      data-testid="pane-contact-info"
    >
      {/* Tabbed header */}
      <div
        style={{
          height: 48,
          flexShrink: 0,
          display: "flex",
          alignItems: "stretch",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          padding: "0 16px",
          gap: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            gap: 0,
          }}
        >
          {(
            [
              { id: "contact", label: "CONTACT INFO" },
              { id: "notes", label: "NOTES" },
              { id: "context", label: "CONTEXT" },
            ] as { id: ContactInfoTab; label: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`contact-pane-tab-${tab.id}`}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive
                    ? `2px solid ${RC_BLUE}`
                    : "2px solid transparent",
                  cursor: "pointer",
                  padding: "0 16px 0 0",
                  marginRight: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: isActive ? RC_BLUE : "#72757a",
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {trailing}
        </div>
      </div>

      {/* Contact info tab content */}
      {activeTab === "contact" && <ContactInfoSections data={data} />}

      {/* Notes tab content — mirrors the AI Insights panel's Notes tab styling */}
      {activeTab === "notes" && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            fontFamily: FONT,
            display: "flex",
            flexDirection: "column",
          }}
          data-testid="contact-pane-notes"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              padding: "8px 16px",
              background: "#f5f6f7",
              boxShadow: "inset 0 1px 0 #eceff1",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <span
              style={{ color: "#80868b" }}
              data-testid="contact-pane-notes-updated"
            >
              Last updated at {INSIGHT_NOTES_UPDATED_AT}
            </span>
            <button
              style={{
                appearance: "none",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: RC_BLUE,
                fontSize: 13,
                fontWeight: 500,
                padding: 0,
                fontFamily: FONT,
              }}
              data-testid="contact-pane-button-update-notes"
            >
              <RefreshCw size={14} strokeWidth={2} />
              Update notes
            </button>
          </div>
          <div style={{ padding: 16 }}>
            {INSIGHT_NOTES.map((section: InsightNoteSection) => (
              <div key={section.heading}>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#212121",
                  }}
                >
                  {section.heading}
                </h3>
                <ul
                  style={{
                    margin: "0 0 18px",
                    paddingLeft: 20,
                    color: "#3c4043",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {section.bullets.map((bullet, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context tab content — per-conversation context with a live hop log */}
      {activeTab === "context" && (
        <ContextTabContent data={data} extraHops={contextHops} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The popup / full-page container
// ---------------------------------------------------------------------------

export interface InteractionPreviewProps {
  mode: InteractionPreviewMode;
  data: InteractionPreviewData;
  takeOverDisabled?: boolean;
  takeOverDisabledTooltip?: string;
  // Runtime hop-log additions for this engagement (take over / transfers),
  // owned by the parent so they survive preview <-> take-over remounts.
  contextHops?: ContextHopEvent[];
  onClose: () => void;
  onEnlarge: () => void;
  onTakeOver: () => void;
}

export function InteractionPreview({
  mode,
  data,
  takeOverDisabled = false,
  takeOverDisabledTooltip,
  contextHops,
  onClose,
  onEnlarge,
  onTakeOver,
}: InteractionPreviewProps) {
  const isFullPage = mode !== "preview";
  const isTakeover = mode === "takeover";

  // Floating preview popup is movable by its header (like the monitoring
  // dialpad); the offset persists while the popup stays mounted.
  const { offset, onDragPointerDown } = useDragPosition();

  // Everything appended after the seed transcript, in arrival order: live
  // scripted messages, the take-over system line, and supervisor-sent
  // messages. Keeping one ordered feed keeps the chat chronological.
  const [feed, setFeed] = useState<PreviewMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  // Index into data.liveScript for the next simulated arrival.
  const liveIdxRef = useRef(0);
  const takeoverMarkedRef = useRef(false);

  const nowLabel = () => {
    const now = new Date();
    let h = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${mins} ${ampm}`;
  };

  // Simulate the live digital interaction: while the preview is open, the
  // scripted conversation keeps arriving. Once the supervisor takes over, the
  // AI agent stops talking — only customer messages continue to arrive.
  // The parent table re-creates `data` every score-drift tick (2.5s), so the
  // effect reads it through a ref instead of depending on it — otherwise the
  // 4.5s timer would reset before ever firing.
  const dataRef = useRef(data);
  dataRef.current = data;
  useEffect(() => {
    let timer: number | undefined;
    const deliverNext = () => {
      const script = dataRef.current.liveScript ?? [];
      let idx = liveIdxRef.current;
      if (isTakeover) {
        while (idx < script.length && script[idx]!.who === "agent") idx += 1;
      }
      if (idx >= script.length) return;
      const next = script[idx]!;
      liveIdxRef.current = idx + 1;
      setFeed((prev) => [...prev, { ...next, time: nowLabel() }]);
      timer = window.setTimeout(deliverNext, 4500);
    };
    // First message lands quickly so the conversation immediately feels live;
    // the rest arrive on a slower, natural cadence.
    timer = window.setTimeout(deliverNext, 1800);
    return () => window.clearTimeout(timer);
  }, [isTakeover]);

  // Entering take-over drops the system marker into the feed exactly once.
  useEffect(() => {
    if (isTakeover && !takeoverMarkedRef.current) {
      takeoverMarkedRef.current = true;
      setFeed((prev) => [
        ...prev,
        { who: "system", text: "You have taken over this conversation" },
      ]);
    }
  }, [isTakeover]);

  const sendDraft = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setFeed((prev) => [
      ...prev,
      { who: "supervisor", name: "You", badge: "SUP", text, time: nowLabel() },
    ]);
    setDraft("");
  }, [draft]);

  const transcript = useMemo<PreviewMessage[]>(
    () => [{ who: "system", text: data.connectedLine }, ...data.messages, ...feed],
    [data, feed],
  );

  // New arrivals keep the transcript pinned to the latest message.
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript.length]);

  const iconButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#212121",
  };

  const takeOverButton = (
    <button
      type="button"
      onClick={takeOverDisabled ? undefined : onTakeOver}
      disabled={takeOverDisabled}
      style={{
        minWidth: 60,
        height: 36,
        padding: "0 16px",
        borderRadius: 10,
        border: "none",
        background: takeOverDisabled ? "#c7c7c7" : RC_BLUE,
        color: "#fff",
        fontSize: 15,
        fontWeight: 500,
        fontFamily: "'Inter', 'Roboto', sans-serif",
        cursor: takeOverDisabled ? "not-allowed" : "pointer",
      }}
      data-testid="button-take-over"
    >
      Take over
    </button>
  );

  const leftPane = (
    <div
      style={{
        flex: isFullPage ? 1 : undefined,
        width: isFullPage ? undefined : 600,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: isFullPage ? 0 : "10px 0 0 10px",
        minHeight: 0,
      }}
      data-testid="pane-interaction-preview"
    >
      {/* Header + channel banner (hidden in the embedded take-over view,
          which starts directly at the subject row per the design). */}
      {!isTakeover && (
        <>
          <div
            onPointerDown={mode === "preview" ? onDragPointerDown : undefined}
            style={{
              height: 73,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 12,
              ...(mode === "preview"
                ? {
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none" as const,
                  }
                : null),
            }}
            data-testid={
              mode === "preview" ? "preview-drag-handle" : undefined
            }
          >
            <span
              style={{
                flex: 1,
                fontSize: 17,
                fontWeight: 500,
                color: "#121212",
                fontFamily: "'Inter', 'Roboto', sans-serif",
              }}
              data-testid="text-preview-title"
            >
              Interaction preview
            </span>
            {mode === "preview" ? (
              <button
                type="button"
                onClick={onEnlarge}
                aria-label="Expand"
                style={iconButtonStyle}
                data-testid="button-enlarge"
              >
                <Maximize2 size={16} strokeWidth={2} />
              </button>
            ) : null}
          </div>
          {/* Channel banner */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "#f9f9f9",
              borderTop: "1px solid #e0e0e0",
              borderBottom: "1px solid #e0e0e0",
            }}
            data-testid="banner-channel"
          >
            <span style={{ display: "inline-flex", fontSize: 14 }}>
              <TypeIcon source={data.sourceType as any} showTip={false} />
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#121212",
                fontFamily: FONT,
                letterSpacing: 0.4,
              }}
            >
              {data.channelLabel}
            </span>
          </div>
        </>
      )}
      {/* Subject + tags */}
      <div
        style={{
          minHeight: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 24px",
          borderBottom: "2px solid #efeff0",
        }}
        data-testid="row-subject"
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#121212",
              fontFamily: FONT,
              lineHeight: "22px",
            }}
          >
            {data.subject}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {data.tags.map((tag) => (
              <span
                key={tag.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 2,
                  background: tag.bg,
                  color: tag.color,
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: FONT,
                }}
                data-testid={`tag-${tag.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
        <MessageSquareMore size={28} strokeWidth={1.6} color="#c056cf" />
      </div>
      {/* Transcript */}
      <div
        ref={transcriptRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          background: "#e7e7e7",
          padding: "16px 16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
        data-testid="area-transcript"
      >
        {transcript.map((m, i) => (
          <TranscriptMessage key={i} m={m} />
        ))}
      </div>
      {/* Footer: Take over (listening) or rich composer (takeover) */}
      {isTakeover ? (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "16px 24px 14px",
            borderTop: "1px solid #e0e0e0",
            background: "#fff",
          }}
          data-testid="row-composer"
        >
          {/* Supervisor avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: "50%",
              background: "#3f65a6",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONT,
              marginTop: 20,
            }}
            data-testid="avatar-composer"
          >
            SUP
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span
              style={{ fontSize: 12, color: "#757575", fontFamily: FONT }}
              data-testid="text-composer-from"
            >
              From <strong style={{ color: "#121212" }}>You (Supervisor)</strong>{" "}
              via {data.agentName}
            </span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendDraft();
                }
              }}
              placeholder="Your message here..."
              rows={2}
              style={{
                width: "100%",
                minHeight: 56,
                resize: "none",
                borderRadius: 8,
                border: "1px solid #d1d1d1",
                padding: "10px 14px",
                fontSize: 14,
                fontFamily: FONT,
                outline: "none",
              }}
              data-testid="input-composer"
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {[
                { Icon: Smile, label: "Emoji" },
                { Icon: Paperclip, label: "Attach file" },
                { Icon: NotebookPen, label: "Canned responses" },
                { Icon: UserRound, label: "Mention" },
                { Icon: Mic, label: "Voice note" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  style={{ ...iconButtonStyle, width: 28, height: 28 }}
                >
                  <Icon size={16} strokeWidth={1.8} color="#616161" />
                </button>
              ))}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "#757575",
                  fontFamily: FONT,
                }}
                data-testid="text-char-count"
              >
                {2000 - draft.length}
              </span>
              <button
                type="button"
                onClick={sendDraft}
                style={{
                  height: 36,
                  marginLeft: 12,
                  padding: "0 18px",
                  borderRadius: 10,
                  border: "none",
                  background: RC_BLUE,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
                data-testid="button-send"
              >
                Send
                <Send size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            padding: "20px 24px",
          }}
        >
          <button
            type="button"
            onClick={() => setTransferOpen(true)}
            style={{
              minWidth: 60,
              height: 36,
              padding: "0 16px",
              borderRadius: 10,
              border: `1px solid ${RC_BLUE}`,
              background: "#fff",
              color: RC_BLUE,
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "'Inter', 'Roboto', sans-serif",
              cursor: "pointer",
            }}
            data-testid="button-transfer"
          >
            Transfer
          </button>
          {takeOverDisabled && takeOverDisabledTooltip ? (
            <Tooltip title={takeOverDisabledTooltip} placement="top">
              <span style={{ display: "inline-flex" }}>{takeOverButton}</span>
            </Tooltip>
          ) : (
            takeOverButton
          )}
        </div>
      )}
    </div>
  );

  // Close X lives in the Contact info pane header per the Figma design. The
  // embedded take-over view shows a collapse affordance instead (the back
  // row above the content is the way out of take-over).
  const contactTrailing = isTakeover ? (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", color: "#616161" }}
      data-testid="icon-collapse-contact"
    >
      <PanelRightClose size={18} strokeWidth={1.8} />
    </span>
  ) : (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "#212121",
      }}
      data-testid="button-close-preview"
    >
      <X size={16} strokeWidth={2} />
    </button>
  );

  // Injects a "Transferred" system message, closes the Transfer dialog and
  // the whole interaction preview — the conversation has been handed off.
  const handleTransferComplete = useCallback(
    (summary: string) => {
      setFeed((prev) => [
        ...prev,
        { who: "system", text: summary, time: nowLabel() },
      ]);
      setTransferOpen(false);
      onClose();
    },
    [onClose],
  );

  const transferDialog = transferOpen ? (
    <TransferMessageDialog
      onCancel={() => setTransferOpen(false)}
      onTransfer={handleTransferComplete}
    />
  ) : null;

  // Take-over renders embedded under the Supervisor tab (the page shows a
  // "← Supervisor" back row above it) — no fixed overlay.
  if (isTakeover) {
    return (
      <>
        <div
          style={{
            display: "flex",
            height: "100%",
            minHeight: 0,
            background: "#fff",
          }}
          data-testid="view-interaction-takeover"
        >
          {leftPane}
          <ContactInfoPane data={data} trailing={contactTrailing} contextHops={contextHops} />
        </div>
        {transferDialog}
      </>
    );
  }

  if (isFullPage) {
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            display: "flex",
            background: "#fff",
          }}
          data-testid={`view-interaction-${mode}`}
        >
          {leftPane}
          <ContactInfoPane data={data} trailing={contactTrailing} contextHops={contextHops} />
        </div>
        {transferDialog}
      </>

    );
  }

  // Floating, non-modal preview: no scrim behind the popup and the page
  // underneath stays clickable. Closing is via the popup's X button.
  return (
    <>
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        background: "transparent",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      data-testid="overlay-interaction-preview"
    >
      {/* Subtle open animation: gentle fade + lift on the popup. */}
      <style>{`
        @keyframes rcxPreviewPopupIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      {/* Exact Figma popup frame: 1030 x 700, movable by its header. */}
      <div
        style={{
          display: "flex",
          width: 1030,
          maxWidth: "calc(100vw - 40px)",
          height: "min(700px, calc(100vh - 40px))",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
          background: "#fff",
          pointerEvents: "auto",
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          animation: "rcxPreviewPopupIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        data-testid="popup-interaction-preview"
      >
        {leftPane}
        <ContactInfoPane data={data} trailing={contactTrailing} contextHops={contextHops} />
      </div>
    </div>
    {transferDialog}
  </>
  );
}
