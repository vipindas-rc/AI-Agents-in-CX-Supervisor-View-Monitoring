import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookUser,
  ChevronDown,
  ChevronUp,
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
import type {
  InteractionPreviewData,
  PreviewHistoryEntry,
  PreviewMessage,
} from "./mock/supervisorMock";

export type InteractionPreviewMode = "preview" | "expanded" | "takeover";

const RC_BLUE = "#066fac";
const FONT = "'Roboto', sans-serif";

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

function ContactInfoPane({
  data,
  trailing,
}: {
  data: InteractionPreviewData;
  // Header action rendered top-right (the close X per Figma, or a collapse
  // affordance in the embedded take-over view).
  trailing?: React.ReactNode;
}) {
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
      <div
        style={{
          height: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <BookUser size={20} strokeWidth={1.8} color="#121212" />
        <span
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: 700,
            color: "#121212",
            fontFamily: FONT,
          }}
        >
          Contact info
        </span>
        {trailing}
      </div>
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
  onClose: () => void;
  onEnlarge: () => void;
  onTakeOver: () => void;
  onHandBack: () => void;
}

export function InteractionPreview({
  mode,
  data,
  takeOverDisabled = false,
  takeOverDisabledTooltip,
  onClose,
  onEnlarge,
  onTakeOver,
  onHandBack,
}: InteractionPreviewProps) {
  const isFullPage = mode !== "preview";
  const isTakeover = mode === "takeover";

  // Everything appended after the seed transcript, in arrival order: live
  // scripted messages, the take-over system line, and supervisor-sent
  // messages. Keeping one ordered feed keeps the chat chronological.
  const [feed, setFeed] = useState<PreviewMessage[]>([]);
  const [draft, setDraft] = useState("");
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
            style={{
              height: 73,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 12,
            }}
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
            justifyContent: "flex-end",
            padding: "20px 24px",
          }}
        >
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

  // Take-over renders embedded under the Supervisor tab (the page shows a
  // "← Supervisor" back row above it) — no fixed overlay.
  if (isTakeover) {
    return (
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
        <ContactInfoPane data={data} trailing={contactTrailing} />
      </div>
    );
  }

  if (isFullPage) {
    return (
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
        <ContactInfoPane data={data} trailing={contactTrailing} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "rcxPreviewOverlayIn 140ms ease-out",
      }}
      onClick={onClose}
      data-testid="overlay-interaction-preview"
    >
      {/* Subtle open animation: quick fade on the scrim, gentle fade + lift on the popup. */}
      <style>{`
        @keyframes rcxPreviewOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rcxPreviewPopupIn {
          from { opacity: 0; transform: translateY(8px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {/* Exact Figma popup frame: 1030 x 700. */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          width: 1030,
          maxWidth: "calc(100vw - 40px)",
          height: "min(700px, calc(100vh - 40px))",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
          background: "#fff",
          animation: "rcxPreviewPopupIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        data-testid="popup-interaction-preview"
      >
        {leftPane}
        <ContactInfoPane data={data} trailing={contactTrailing} />
      </div>
    </div>
  );
}
