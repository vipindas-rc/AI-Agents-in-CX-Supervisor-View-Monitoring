import { useEffect, useState } from "react";
import { X } from "lucide-react";

const ROBOTO =
  "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const DEFAULT_HANDOFF_PHRASE = "Let me bring in a colleague to help with this.";

export interface BargeSettings {
  // When true the customer never sees the supervisor's identity (the AI keeps
  // its persona). When false the supervisor joins under their own name.
  anonymous: boolean;
  // Spoken to the customer on a voice call before the supervisor is connected.
  handoffPhrase: string;
}

export const DEFAULT_BARGE_SETTINGS: BargeSettings = {
  anonymous: true,
  handoffPhrase: DEFAULT_HANDOFF_PHRASE,
};

interface Props {
  agentName: string;
  // 'AI' for Air agents, 'agent' for human agents — drives the wording.
  subject: string;
  // Voice interactions play a spoken handoff phrase; digital ones hand over
  // silently, so the phrase field is hidden for them.
  isVoice: boolean;
  initial: BargeSettings;
  onCancel: () => void;
  onConfirm: (settings: BargeSettings) => void;
}

// Combined "pause & barge" dialog: taking over always pauses the AI/agent and
// connects the supervisor in one action — pause is never invoked on its own.
export function PauseBargeModal({
  agentName,
  subject,
  isVoice,
  initial,
  onCancel,
  onConfirm,
}: Props) {
  const [anonymous, setAnonymous] = useState(initial.anonymous);
  const [handoffPhrase, setHandoffPhrase] = useState(initial.handoffPhrase);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: ROBOTO,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "16px",
    letterSpacing: "0.4px",
    color: "#757575",
    marginBottom: 8,
  };

  return (
    <div
      data-testid="overlay-pause-barge"
      onMouseDown={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.24)",
        zIndex: 10002,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        data-testid="modal-pause-barge"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          marginTop: 60,
          width: 500,
          maxWidth: "calc(100vw - 32px)",
          background: "#fff",
          borderRadius: 4,
          boxShadow:
            "0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12), 0px 5px 5px -3px rgba(0,0,0,0.20)",
          fontFamily: ROBOTO,
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ position: "relative", padding: "24px 24px 0 24px" }}>
          <h2
            data-testid="text-pause-barge-title"
            style={{
              margin: 0,
              fontFamily: ROBOTO,
              fontWeight: 500,
              fontSize: 20,
              lineHeight: "22px",
              letterSpacing: "0.15px",
              color: "#212121",
            }}
          >
            Take over from {agentName}
          </h2>
          <button
            type="button"
            aria-label="Close"
            data-testid="button-close-pause-barge"
            onClick={onCancel}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#5f6368",
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 24px 0 24px" }}>
          <p
            data-testid="text-pause-barge-description"
            style={{
              margin: "0 0 20px 0",
              fontFamily: ROBOTO,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: "20px",
              letterSpacing: "0.25px",
              color: "#3c4043",
            }}
          >
            This pauses the {subject} and connects you directly to the customer.
            You can hand the conversation back at any time.
          </p>

          <label style={labelStyle}>How you appear to the customer</label>
          <div
            role="radiogroup"
            style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}
          >
            <IdentityOption
              testId="radio-anonymous"
              selected={anonymous}
              title="Anonymous"
              caption={`The customer keeps seeing ${agentName}; your name stays hidden.`}
              onSelect={() => setAnonymous(true)}
            />
            <IdentityOption
              testId="radio-named"
              selected={!anonymous}
              title="Join with my name"
              caption="The customer sees that a supervisor has joined the conversation."
              onSelect={() => setAnonymous(false)}
            />
          </div>

          {isVoice ? (
            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle} htmlFor="input-handoff-phrase">
                Handoff phrase (played to the customer before you join)
              </label>
              <textarea
                id="input-handoff-phrase"
                data-testid="input-handoff-phrase"
                value={handoffPhrase}
                onChange={(e) => setHandoffPhrase(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  padding: "8px 12px",
                  fontFamily: ROBOTO,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "0.25px",
                  color: "#212121",
                }}
              />
            </div>
          ) : (
            <p
              data-testid="text-digital-note"
              style={{
                margin: 0,
                fontFamily: ROBOTO,
                fontSize: 13,
                lineHeight: "18px",
                color: "#80868b",
              }}
            >
              Digital takeover is seamless — the customer isn't notified of the
              switch.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 32,
            borderTop: "1px solid #efeff0",
            padding: "24px 23px 24px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 24,
          }}
        >
          <button
            type="button"
            data-testid="button-cancel-pause-barge"
            onClick={onCancel}
            style={{
              border: "none",
              background: "transparent",
              color: "#066fac",
              fontFamily: ROBOTO,
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.15px",
              lineHeight: "20px",
              padding: "10px 22px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="button-confirm-pause-barge"
            onClick={() =>
              onConfirm({ anonymous, handoffPhrase: handoffPhrase.trim() })
            }
            style={{
              border: "none",
              background: "#066fac",
              color: "#fff",
              fontFamily: ROBOTO,
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.15px",
              lineHeight: "20px",
              borderRadius: 4,
              height: 40,
              padding: "10px 22px",
              cursor: "pointer",
            }}
          >
            Pause &amp; take over
          </button>
        </div>
      </div>
    </div>
  );
}

function IdentityOption({
  testId,
  selected,
  title,
  caption,
  onSelect,
}: {
  testId: string;
  selected: boolean;
  title: string;
  caption: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-testid={testId}
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        textAlign: "left",
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        cursor: "pointer",
        background: selected ? "#e8f1f8" : "#fff",
        border: `1px solid ${selected ? "#066fac" : "#e0e0e0"}`,
        fontFamily: ROBOTO,
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `2px solid ${selected ? "#066fac" : "#bdbdbd"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#066fac",
            }}
          />
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: "20px",
            letterSpacing: "0.25px",
            color: "#212121",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 400,
            lineHeight: "18px",
            color: "#5f6368",
          }}
        >
          {caption}
        </span>
      </span>
    </button>
  );
}
