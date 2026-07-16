import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquareMore,
  MoreVertical,
  PanelRightClose,
  PanelRightOpen,
  PhoneIncoming,
  PhoneOutgoing,
  Sparkles,
  StickyNote,
} from "lucide-react";

import type { PreviewHistoryEntry } from "./mock/supervisorMock";
import { makeInteractionPreview } from "./mock/supervisorMock";

const RC_BLUE = "#066fac";
const FONT = "'Roboto', sans-serif";

// ---------------------------------------------------------------------------
// Active calls view shown after a supervisor takes over a voice call
// (Figma node 88-71398): left "Details" area with the Interaction card and a
// right Contact info panel (contact profile + interaction history). The
// Agent Assist tab is intentionally omitted.
// ---------------------------------------------------------------------------

export interface ActiveCallViewProps {
  /** Agent the call was taken over from (used for the mock data identity). */
  agentId?: string | null;
}

// Figma-literal call details for the taken-over voice interaction.
const CALL_DETAILS: { label: string; value: string }[] = [
  { label: "Phone", value: "(720) 715-9212" },
  { label: "State", value: "Active" },
  { label: "DNIS", value: "(866) 929-1390" },
  { label: "Start time", value: "May 13, 2024 03:15PM" },
];

const QUEUE_NAME = "Technical Support";

// Contact profile fields per the Figma contact accordion.
const CONTACT_FIELDS: { label: string; value: string }[] = [
  { label: "First name", value: "Rafael" },
  { label: "Last name", value: "Mobley" },
  { label: "Company", value: "RingCentral" },
  { label: "Gender", value: "Male" },
  { label: "Email", value: "rafael.mobley@example.com" },
  { label: "Cell phone", value: "(866) 929-1390" },
  { label: "Fixed line", value: "(650) 555-0139" },
  { label: "Notes", value: "Prefers callbacks after 2 PM PT." },
];

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
      data-testid="row-activecall-history-entry"
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
        <div style={{ width: 1.35, flex: 1, background: "#c5c7cd", minHeight: 12 }} />
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
            <p style={{ fontSize: 14, color: "#121212", lineHeight: "20px", margin: 0 }}>
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
                    data-testid="button-activecall-show-more"
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
            <span style={{ fontSize: 14, fontStyle: "italic", color: "#616161" }}>
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

// Accordion header row shared by the contact + history sections.
function SectionHeader({
  title,
  subtitle,
  expanded,
  menu,
  onToggle,
  testId,
}: {
  title: string;
  subtitle?: string;
  expanded: boolean;
  menu?: boolean;
  onToggle: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        appearance: "none",
        border: "none",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        minHeight: 64,
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "1px solid rgba(221,223,229,0.5)",
        background: expanded ? "#f9f9f9" : "#fff",
        fontFamily: FONT,
        flexShrink: 0,
      }}
      data-testid={testId}
      aria-expanded={expanded}
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
        <span style={{ fontSize: 14, fontWeight: 700, color: "#121212" }}>{title}</span>
        {subtitle ? (
          <span style={{ fontSize: 12, color: "#72757a" }}>{subtitle}</span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {menu ? <MoreVertical size={18} strokeWidth={1.8} color="#616161" /> : null}
        {expanded ? (
          <ChevronUp size={18} strokeWidth={1.8} color="#616161" />
        ) : (
          <ChevronDown size={18} strokeWidth={1.8} color="#616161" />
        )}
      </div>
    </button>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "8px 16px",
        fontFamily: FONT,
      }}
      data-testid={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <span style={{ width: 112, flexShrink: 0, fontSize: 12, color: "#666666" }}>
        {label}
      </span>
      <span style={{ flex: 1, paddingLeft: 16, fontSize: 14, color: "#121212" }}>
        {value}
      </span>
    </div>
  );
}

export function ActiveCallView(_props: ActiveCallViewProps) {
  const data = makeInteractionPreview(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        minHeight: 0,
        background: "#fff",
      }}
      data-testid="view-active-call"
    >
      {/* ---------- LEFT: call details ---------- */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            fontFamily: FONT,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#121212" }}>
            Details
          </span>
          {!panelOpen ? (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              aria-label="Show contact info"
              style={{
                appearance: "none",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#616161",
                display: "inline-flex",
              }}
              data-testid="button-activecall-open-panel"
            >
              <PanelRightOpen size={18} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
        <div style={{ padding: 20, maxWidth: 720 }}>
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              overflow: "hidden",
            }}
            data-testid="card-activecall-interaction"
          >
            <SectionHeader
              title="Interaction"
              subtitle={`Queue: ${QUEUE_NAME}`}
              expanded={detailsExpanded}
              menu
              onToggle={() => setDetailsExpanded((v) => !v)}
              testId="section-activecall-interaction"
            />
            {detailsExpanded ? (
              <div style={{ padding: "8px 0" }}>
                {CALL_DETAILS.map((row) => (
                  <FieldRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ---------- RIGHT: contact info panel ---------- */}
      {panelOpen ? (
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
          data-testid="pane-activecall-contact"
        >
          {/* Header: CONTACT INFO tab only (no Agent Assist) + collapse */}
          <div
            style={{
              height: 48,
              flexShrink: 0,
              display: "flex",
              alignItems: "stretch",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              padding: "0 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderBottom: `2px solid ${RC_BLUE}`,
                  padding: "0 16px 0 0",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: RC_BLUE,
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "nowrap",
                }}
                data-testid="tab-activecall-contact-info"
              >
                CONTACT INFO
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Hide contact info"
                style={{
                  appearance: "none",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#616161",
                  display: "inline-flex",
                }}
                data-testid="button-activecall-collapse-panel"
              >
                <PanelRightClose size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {/* Contact accordion */}
            <SectionHeader
              title={data.contactName}
              subtitle={data.contactPhone}
              expanded={contactExpanded}
              menu
              onToggle={() => setContactExpanded((v) => !v)}
              testId="section-activecall-contact"
            />
            {contactExpanded ? (
              <div
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(221,223,229,0.5)",
                }}
              >
                {CONTACT_FIELDS.map((f) => (
                  <FieldRow key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
            ) : null}

            {/* Interaction history accordion */}
            <SectionHeader
              title="Interaction history"
              subtitle={data.historyCountLabel}
              expanded={historyExpanded}
              onToggle={() => setHistoryExpanded((v) => !v)}
              testId="section-activecall-history"
            />
            {historyExpanded ? (
              <div style={{ padding: "16px 16px 0" }}>
                {data.history.map((entry, i) => (
                  <HistoryEntry
                    key={`${entry.date}-${i}`}
                    entry={entry}
                    isLast={i === data.history.length - 1}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ActiveCallView;
