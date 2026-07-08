import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

// Built 1:1 from the Figma "Update agent state" modal (node 15:1522) and its
// open-dropdown / success-toast companion frames. The dropdown offers the exact
// states shown in the design, each with its status-dot colour (see agentState.ts).
export interface AgentStateOption {
  key: string;
  label: string;
  color: string;
}

// Human agents: the supervisor-settable work states from the Figma design.
export const HUMAN_STATE_OPTIONS: AgentStateOption[] = [
  { key: "AVAILABLE", label: "Available", color: "#25A73C" },
  { key: "TRAINING", label: "Training", color: "#F7B500" },
  { key: "WORKING", label: "Working", color: "#F7B500" },
  { key: "LUNCH", label: "Lunch", color: "#BDBDBD" },
  { key: "AUX-UNAVAIL-OFFHOOK", label: "Allow Offhook", color: "#d63e39" },
];

// AirPro (AI) agents can't take work breaks; a supervisor only turns them on
// (Available) or off (Inactive). Engaged is automatic and Pending Inactive is a
// transitional drain state, so neither is manually selectable here.
export const AIR_STATE_OPTIONS: AgentStateOption[] = [
  { key: "AVAILABLE", label: "Available", color: "#25A73C" },
  { key: "INACTIVE", label: "Inactive", color: "#616161" },
];

export function agentStateOptionsFor(
  agentType?: string,
): AgentStateOption[] {
  return agentType === "Air" ? AIR_STATE_OPTIONS : HUMAN_STATE_OPTIONS;
}

const ROBOTO =
  "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

interface Props {
  /** Accepted for call-site context; the Figma modal does not render the name. */
  agentName?: string;
  /** Drives which state options the dropdown offers (Air vs Human). */
  agentType?: string;
  onCancel: () => void;
  onUpdate: (option: AgentStateOption) => void;
}

export function UpdateAgentStateModal({ agentType, onCancel, onUpdate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<AgentStateOption | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const options = agentStateOptionsFor(agentType);

  // Close on Escape, mirroring standard dialog behaviour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      data-testid="overlay-update-agent-state"
      onMouseDown={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.24)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        ref={cardRef}
        data-testid="modal-update-agent-state"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          marginTop: 60,
          width: 500,
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
            data-testid="text-modal-title"
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
            Update agent state
          </h2>
          <button
            type="button"
            aria-label="Close"
            data-testid="button-close-modal"
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
        <div style={{ padding: "20px 24px 0 24px" }}>
          <label
            style={{
              display: "block",
              fontFamily: ROBOTO,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: "16px",
              letterSpacing: "0.4px",
              color: "#757575",
              marginBottom: 6,
            }}
          >
            Agent state
          </label>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              data-testid="select-agent-state"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                width: "100%",
                height: 32,
                minHeight: 32,
                maxHeight: 40,
                boxSizing: "border-box",
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 4,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontFamily: ROBOTO,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: "0.25px",
                  lineHeight: "20px",
                  color: "#212121",
                }}
              >
                {selected && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: selected.color,
                      flexShrink: 0,
                    }}
                  />
                )}
                {selected ? selected.label : ""}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                style={{
                  color: "#5f6368",
                  transform: menuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 120ms ease",
                  flexShrink: 0,
                }}
              />
            </button>

            {menuOpen && (
              <ul
                data-testid="list-agent-state-options"
                style={{
                  listStyle: "none",
                  margin: "2px 0 0 0",
                  padding: "4px 0",
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  boxShadow:
                    "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
                  zIndex: 20,
                }}
              >
                {options.map((opt) => {
                  const isSelected = selected?.key === opt.key;
                  return (
                    <li key={opt.key}>
                      <button
                        type="button"
                        data-testid={`option-${opt.key}`}
                        onClick={() => {
                          setSelected(opt);
                          setMenuOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "6px 12px",
                          border: "none",
                          background: isSelected ? "#f5f5f5" : "transparent",
                          cursor: "pointer",
                          fontFamily: ROBOTO,
                          fontSize: 14,
                          fontWeight: 400,
                          letterSpacing: "0.25px",
                          lineHeight: "20px",
                          color: "#212121",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            isSelected ? "#f5f5f5" : "transparent";
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: opt.color,
                            flexShrink: 0,
                          }}
                        />
                        {opt.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
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
            data-testid="button-cancel-state"
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
            data-testid="button-update-state"
            disabled={!selected}
            onClick={() => selected && onUpdate(selected)}
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
              minWidth: 87,
              padding: "10px 22px",
              cursor: selected ? "pointer" : "not-allowed",
              opacity: selected ? 1 : 0.5,
            }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

// Green success toast, top-right, matching Figma node 15:4485 (#368541).
export function AgentStateToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      data-testid="toast-agent-state-success"
      style={{
        position: "fixed",
        top: 80,
        right: 17,
        width: 512,
        maxWidth: "calc(100vw - 34px)",
        background: "#368541",
        borderRadius: 4,
        boxShadow: "0px 1px 5px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "14px 16px",
        zIndex: 10001,
        fontFamily: ROBOTO,
      }}
    >
      <span
        style={{
          flex: "1 0 0",
          color: "#fff",
          fontSize: 14,
          fontWeight: 400,
          lineHeight: "20px",
          letterSpacing: "0.25px",
        }}
      >
        {message}
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        data-testid="button-dismiss-toast"
        onClick={onClose}
        style={{
          marginLeft: 12,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#fff",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
