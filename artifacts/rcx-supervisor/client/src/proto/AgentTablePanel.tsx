import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "styled-components";
import { RcThemeProvider } from "@ringcentral/juno";
import { theme } from "@ringcx/ui";

import "./i18n";
import "./vendor/ringcx-ui/icons/digital-icons/digital-icons.css";
import "./vendor/ringcx-ui/icons/engage-icons/engage-icons.css";

import { SupervisorAgentList } from "./eag/containers/SupervisorAgentList/SupervisorAgentList";
import { DigitalInteractionTable } from "./eag/components/DigitalInteractionTable/DigitalInteractionTable";
import AiInsightsPanel from "./eag/components/AiInsightsPanel/AiInsightsPanel";
import {
  PauseBargeModal,
  DEFAULT_BARGE_SETTINGS,
  type BargeSettings,
} from "./PauseBargeModal";
import { Dialer } from "./dialer/Dialer";
import { MonitoringDialpad } from "./dialer/MonitoringDialpad";
import { ReassignConversationModal } from "./ReassignConversationModal";
import { InteractionRollupModal } from "./eag/containers/SupervisorAgentList/components/InteractionRollupModal";
import {
  UpdateAgentStateModal,
  AgentStateToast,
  type AgentStateOption,
} from "./UpdateAgentStateModal";
import {
  columns,
  interactionColumns,
  makeAgents,
  makeInteractions,
  makeInteractionPreview,
  rollupColumns,
} from "./mock/supervisorMock";
import {
  InteractionPreview,
  type InteractionPreviewMode,
} from "./InteractionPreview";

// Single source of truth for the agent table column ids/labels, derived directly
// from the proto column definitions. Consumed by the page's settings dialog so
// the checkbox list can never drift from the real table columns.
export const agentColumnMeta: { id: string; label: string }[] = columns.map(
  (c) => ({ id: c.id, label: String(c.content) }),
);

// Same single-source-of-truth treatment for the Interactions table, derived from
// the real interaction column definitions so the settings dialog list can never
// drift from the columns actually rendered in the table.
export const interactionColumnMeta: { id: string; label: string }[] =
  interactionColumns.map((c) => ({ id: c.id, label: String(c.content) }));

// Distinct agent states present in the mock, partitioned by agent type, so the
// page's State filter can offer exactly the states that appear in the table
// (human states for Human, AirPro states for AirPro, the union for All).
const _stateMetaAgents = makeAgents(25) as any[];
const _distinctStates = (xs: string[]) => Array.from(new Set(xs));
export const agentStateOptions: Record<"All" | "Air" | "Human", string[]> = {
  All: _distinctStates(_stateMetaAgents.map((a) => a.agentState)),
  Air: _distinctStates(
    _stateMetaAgents
      .filter((a) => a.agentType === "Air")
      .map((a) => a.agentState),
  ),
  Human: _distinctStates(
    _stateMetaAgents
      .filter((a) => a.agentType === "Human")
      .map((a) => a.agentState),
  ),
};

// Per-agent options for the Interactions-tab "All agents" picker, derived from
// the agents that actually appear in the interaction data (so every option
// resolves to at least one row). Keyed by agentId, labelled with the agent's
// display name (AirPro agents carry their "Name (Role)" identity).
const _interactionAgents = makeInteractions() as any[];
export const agentFilterOptions: { value: string; label: string }[] =
  Array.from(
    new Map(
      _interactionAgents.map((r) => [r.agentId, r.fullName]),
    ).entries(),
  ).map(([value, label]) => ({ value, label }));

interface AgentTablePanelProps {
  activeTab?: "Agents" | "Interactions";
  searchValue?: string;
  selectedStates?: string[];
  selectedChannels?: string[];
  selectedAgentGroups?: string[];
  agentTypeFilter?: "All" | "Air" | "Human";
  statusFilter?: "All" | "Active" | "Inactive";
  visibleColumnIds?: string[];
  selectedAgentIds?: string[];
  selectedCategories?: string[];
  visibleInteractionColumnIds?: string[];
  onActiveInteractionsClick?: (agentId: string) => void;
  highlightAgentId?: string | null;
  highlightNonce?: number;
  // Digital AI-agent monitoring preview (URL-driven by the page): the engagement
  // being previewed and the current view mode, plus navigation callbacks.
  previewEngagementId?: string | null;
  previewMode?: InteractionPreviewMode | null;
  onPreviewOpen?: (engagementId: string) => void;
  onPreviewModeChange?: (mode: InteractionPreviewMode) => void;
  onPreviewClose?: () => void;
}

export default function AgentTablePanel({
  activeTab = "Agents",
  searchValue = "",
  selectedStates = [],
  selectedChannels = [],
  selectedAgentGroups = [],
  agentTypeFilter = "All",
  statusFilter = "All",
  visibleColumnIds,
  selectedAgentIds = [],
  selectedCategories = [],
  visibleInteractionColumnIds,
  onActiveInteractionsClick,
  highlightAgentId,
  highlightNonce,
  previewEngagementId = null,
  previewMode = null,
  onPreviewOpen,
  onPreviewModeChange,
  onPreviewClose,
}: AgentTablePanelProps) {
  const [agents, setAgents] = useState(() => makeAgents(25));
  const [interactions, setInteractions] = useState(() => makeInteractions());
  const [interactionCols] = useState(() =>
    interactionColumns.map((c: any) => ({ ...c })),
  );

  // Capture the seeded confidence/sentiment values once. Live scores oscillate
  // around these fixed bases: most rows hold their band while a few borderline
  // bases (parked on a threshold in supervisorMock) drift back and forth across
  // it, so their rows flip in and out of the flagged treatment live — the
  // "real-time" supervision signal (mock-simulated).
  const baseScoresRef = useRef<
    Record<string, { c: number | null; s: number | null }>
  >({});
  if (Object.keys(baseScoresRef.current).length === 0) {
    const map: Record<string, { c: number | null; s: number | null }> = {};
    interactions.forEach((r: any) => {
      map[r.engagementId] = {
        c: typeof r.confidenceScore === "number" ? r.confidenceScore : null,
        s: typeof r.sentimentScore === "number" ? r.sentimentScore : null,
      };
    });
    baseScoresRef.current = map;
  }

  // Deterministic bounded drift (±5) keyed by tick + per-row seed, so the
  // simulation is reproducible rather than using Math.random.
  useEffect(() => {
    if (activeTab !== "Interactions") return;
    let tick = 0;
    const drift = (base: number | null, seed: number): number | null =>
      typeof base === "number"
        ? Math.max(
            0,
            Math.min(100, Math.round(base + 5 * Math.sin((tick + seed) * 1.3))),
          )
        : base;
    const id = window.setInterval(() => {
      tick += 1;
      setInteractions((prev) =>
        prev.map((r: any, i: number) => {
          const b = baseScoresRef.current[r.engagementId];
          if (!b) return r;
          return {
            ...r,
            confidenceScore: drift(b.c, i),
            sentimentScore: drift(b.s, i + 7),
          };
        }),
      );
    }, 2500);
    return () => window.clearInterval(id);
  }, [activeTab]);
  const [monitoredId, setMonitoredId] = useState<string | null>(null);
  // Engagement id of the voice interaction currently being monitored (from the
  // Interactions tab), used only to highlight that specific row — the dialpad
  // popup itself is keyed off monitoredId/agents, same as the Agents tab.
  const [monitoredEngagementId, setMonitoredEngagementId] = useState<
    string | null
  >(null);
  // AI Insights side panel: holds the opened interaction's context (or null).
  // engagementId keys back to the live interaction row so the panel's Sentiment /
  // Confidence stay in sync with the table and the row stays highlighted.
  const [insightCtx, setInsightCtx] = useState<{
    agentName: string;
    isVoice: boolean;
    engagementId: string;
    agentType?: string;
  } | null>(null);
  // Engagement the supervisor has actively taken over (AI/agent paused), and
  // whether the pause-&-barge confirmation dialog is open.
  const [bargedId, setBargedId] = useState<string | null>(null);
  const [pauseBargeOpen, setPauseBargeOpen] = useState(false);
  // Supervisor's barge defaults (identity + voice handoff phrase), persisted so
  // they act as a reusable setting across takeovers.
  const [bargeSettings, setBargeSettings] = useState<BargeSettings>(() => {
    try {
      const raw = window.localStorage.getItem("eag.bargeSettings");
      if (raw) return { ...DEFAULT_BARGE_SETTINGS, ...JSON.parse(raw) };
    } catch {
      /* ignore malformed/blocked storage */
    }
    return DEFAULT_BARGE_SETTINGS;
  });
  const [rollup, setRollup] = useState<{
    agentId: string;
    x: number;
    y: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [stateModalAgentId, setStateModalAgentId] = useState<string | null>(
    null,
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [agentCols] = useState(() => columns.map((c: any) => ({ ...c })));

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2600);
  };
  const flashRef = useRef(flash);
  flashRef.current = flash;

  // Whether the dialer transfer workflow overlay (voice) is open.
  const [transferOpen, setTransferOpen] = useState(false);
  // Whether the "Reassign conversation" modal (digital) is open.
  const [reassignOpen, setReassignOpen] = useState(false);

  // Monitoring is voice-only: the Monitor icon is enabled ONLY when every one
  // of the agent's active interactions is a voice call. Any digital interaction
  // (alone or mixed with voice) or no interactions at all -> disabled icon with
  // an explanatory tooltip. The monitored-row highlight is driven separately by
  // monitoredAgent.monitoredAgentId in the row renderer (not by showMonitor).
  // Agent type + status filtering is applied here (pre-filter), while state /
  // channel / search filtering runs inside the GridList via props.
  const displayAgents = useMemo(
    () =>
      agents
        .filter((a: any) => {
          if (agentTypeFilter !== "All" && a.agentType !== agentTypeFilter) {
            return false;
          }
          if (
            agentTypeFilter === "Air" &&
            statusFilter !== "All" &&
            a.status !== statusFilter
          ) {
            return false;
          }
          if (
            selectedAgentGroups.length > 0 &&
            !selectedAgentGroups.includes(a.skill)
          ) {
            return false;
          }
          return true;
        })
        .map((a: any) => {
          const { subRows, ...rest } = a; // non-expandable (avoids GridList grouped path)
          const active: any[] = a.activeInteractions ?? [];
          const isVoiceOnly =
            active.length > 0 &&
            active.every((it: any) => it.channelType === "VOICE");
          return {
            ...rest,
            showMonitor: isVoiceOnly,
            disabledTooltip: isVoiceOnly
              ? undefined
              : "You can only monitor voice calls",
            showLogout: true,
            // "Update agent state" is offered for every agent: AirPro agents get
            // the Inactive/Pending-Inactive lifecycle toggle, human agents get a
            // simple Available <-> On Break supervisor override.
            showChangeState: true,
          };
        }),
    [agents, agentTypeFilter, statusFilter, selectedAgentGroups],
  );

  // Interactions are pre-filtered by Agent Type (Air/Human/All), mirroring the
  // Agent List behavior. Monitor gating per row: voice rows keep their existing
  // behavior; digital rows handled by an AirPro (AI) agent get an ENABLED
  // monitor icon (opens the Interaction preview popup); digital rows handled by
  // a human agent stay voice-only gated with the explanatory tooltip.
  const displayInteractions = useMemo(
    () =>
      interactions
        .filter((it: any) => {
          if (agentTypeFilter !== "All" && it.agentType !== agentTypeFilter) {
            return false;
          }
          return true;
        })
        .map((it: any) => {
          if (it.isVoiceInteraction || it.agentType === "Air") return it;
          return {
            ...it,
            showMonitor: false,
            monitorDisabledTooltip: "You can only monitor voice calls",
          };
        }),
    [interactions, agentTypeFilter],
  );

  const visibleAgentCols = useMemo(() => {
    // No selection provided -> show every column in its native order.
    if (!visibleColumnIds) {
      return agentCols.map((c: any) => ({ ...c, visible: true }));
    }
    // Render columns in the exact order the settings dialog provides, with the
    // Agent (fullName) column always pinned first.
    const byId = new Map(agentCols.map((c: any) => [c.id, c]));
    const orderedIds = visibleColumnIds.includes("fullName")
      ? visibleColumnIds
      : ["fullName", ...visibleColumnIds];
    return orderedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((c: any) => ({ ...c, visible: true }));
  }, [agentCols, visibleColumnIds]);

  const visibleInteractionCols = useMemo(
    () =>
      interactionCols
        .map((c: any) => ({
          ...c,
          // the Channel (sourceName) column is always visible; others follow the
          // settings dialog selection (when provided).
          visible:
            c.id === "sourceName" ||
            !visibleInteractionColumnIds ||
            visibleInteractionColumnIds.includes(c.id),
        }))
        .filter((c: any) => c.visible),
    [interactionCols, visibleInteractionColumnIds],
  );

  // Toggle semantics: clicking Monitor on the currently-monitored agent stops
  // monitoring (clears the blue row and closes the monitoring dialpad popup);
  // clicking it on another agent switches the monitoring session — the popup
  // remounts (keyed by agentId) and resets to the listening state.
  const monitorAgentCallback = useCallback(
    (agentId: string) => {
      const a = agents.find((x: any) => x.agentId === agentId);
      const isStopping = monitoredId === agentId;
      setMonitoredId(isStopping ? null : agentId);
      if (isStopping) {
        flashRef.current(`Stopped monitoring ${a?.fullName ?? agentId}`);
      }
      return {} as any;
    },
    [agents, monitoredId],
  );

  // Closing the monitoring popup (titlebar close or End call) ends the
  // monitoring session and clears the monitored-row highlight.
  const stopMonitoring = useCallback(() => {
    setMonitoredId((cur) => {
      if (cur) {
        const a = agents.find((x: any) => x.agentId === cur);
        flashRef.current(`Stopped monitoring ${a?.fullName ?? cur}`);
      }
      return null;
    });
    setMonitoredEngagementId(null);
  }, [agents]);

  const monitoredAgentRow = useMemo(
    () =>
      monitoredId
        ? (agents.find((x: any) => x.agentId === monitoredId) as any) ?? null
        : null,
    [agents, monitoredId],
  );

  const onLogOut = useCallback(
    (agentId: string) => {
      const a = agents.find((x: any) => x.agentId === agentId);
      setAgents((prev: any[]) => prev.filter((x) => x.agentId !== agentId));
      setMonitoredId((cur) => (cur === agentId ? null : cur));
      flash(`Logged out ${a?.fullName ?? agentId}`);
    },
    [agents],
  );

  // The "Update agent state" menu action opens the Figma state-picker modal
  // (instead of toggling inline). The supervisor chooses a state and applies it
  // on Update, which shows the green success toast from the design.
  const changeAgentState = useCallback((agentId: string) => {
    setStateModalAgentId(agentId);
  }, []);

  // Drains an AirPro agent that still has in-flight work: it sits in Pending
  // Inactive until its interactions finish, then flips to Inactive (off).
  const scheduleDrain = useCallback((agentId: string, fullName: string) => {
    window.setTimeout(() => {
      setAgents((prev: any[]) =>
        prev.map((a) =>
          a.agentId === agentId
            ? {
                ...a,
                agentState: "Inactive",
                agentStateLabel: "Inactive",
                agentBaseState: "INACTIVE",
                status: "Inactive",
                activeInteractions: [],
                activeInteractionsSearchCols: [],
              }
            : a,
        ),
      );
      flash(`${fullName} is now Inactive`);
    }, 3000);
  }, []);

  const applyAgentState = useCallback(
    (option: AgentStateOption) => {
      const id = stateModalAgentId;
      if (!id) return;
      const agent = agents.find((a: any) => a.agentId === id) as any;
      setStateModalAgentId(null);

      const showSuccess = () => {
        setSuccessToast("The agent's state has been updated successfully.");
        window.clearTimeout((applyAgentState as any)._t);
        (applyAgentState as any)._t = window.setTimeout(
          () => setSuccessToast(null),
          4000,
        );
      };

      // AirPro agents being switched off (Inactive) drain their in-flight work
      // through Pending Inactive first; idle ones go straight to Inactive.
      if (agent?.agentType === "Air" && option.key === "INACTIVE") {
        const hasWork =
          agent.agentBaseState === "ENGAGED" ||
          (agent.activeInteractions?.length ?? 0) > 0;
        if (hasWork) {
          setAgents((prev: any[]) =>
            prev.map((a) =>
              a.agentId === id
                ? {
                    ...a,
                    agentState: "Pending Inactive",
                    agentStateLabel: "Pending Inactive",
                    agentBaseState: "PENDING-INACTIVE",
                    status: "Active",
                  }
                : a,
            ),
          );
          scheduleDrain(id, agent.fullName);
          showSuccess();
          return;
        }
        setAgents((prev: any[]) =>
          prev.map((a) =>
            a.agentId === id
              ? {
                  ...a,
                  agentState: "Inactive",
                  agentStateLabel: "Inactive",
                  agentBaseState: "INACTIVE",
                  status: "Inactive",
                  activeInteractions: [],
                  activeInteractionsSearchCols: [],
                }
              : a,
          ),
        );
        showSuccess();
        return;
      }

      // Everyone else (humans, or AirPro going Available) takes the chosen
      // state directly. AirPro agents stay Active when given a non-off state.
      setAgents((prev: any[]) =>
        prev.map((a) =>
          a.agentId === id
            ? {
                ...a,
                agentState: option.label,
                agentStateLabel: option.label,
                agentBaseState: option.key,
                status: a.agentType === "Air" ? "Active" : a.status,
              }
            : a,
        ),
      );
      showSuccess();
    },
    [stateModalAgentId, agents, scheduleDrain],
  );

  // "AI insights" action on an interaction row -> open the AI Insights sidebar
  // with that interaction's context (handling agent + voice/digital channel).
  const viewInsightCallback = useCallback(
    (_agentId: string, uii: string) => {
      const row = interactions.find((r: any) => r.engagementId === uii) as any;
      setInsightCtx({
        agentName: row?.fullName ?? "Agent",
        isVoice: Boolean(row?.isVoiceInteraction),
        engagementId: uii,
        agentType: row?.agentType,
      });
    },
    [interactions],
  );

  // Row-level hover actions on an interaction. The legacy "barge-in" trigger
  // must NOT fire an instant barge — it routes through the single combined
  // Pause-&-Barge flow: open the AI Insights panel for that interaction, then
  // the confirm modal. This keeps "take over" as one action that can't be
  // bypassed, for both voice and digital.
  //
  // Voice Monitor and Whisper (coach) route through the same monitoring
  // dialpad used on the Agents tab, keyed to the interaction's agent, with
  // the row highlighted for as long as that dialpad is open. Digital Monitor
  // keeps its current toast-only preview (a real digital monitoring/take-over
  // experience is separate follow-up work).
  const monitorInteractionCallback = useCallback(
    (agentId: string, type?: string, uii?: string) => {
      const row = interactions.find(
        (r: any) => r.engagementId === uii,
      ) as any;

      if (type === "bargeIn") {
        setInsightCtx({
          agentName: row?.fullName ?? "Agent",
          isVoice: Boolean(row?.isVoiceInteraction),
          engagementId: uii ?? "",
          agentType: row?.agentType,
        });
        setPauseBargeOpen(true);
        return;
      }

      if (row?.isVoiceInteraction && (type === "monitor" || type === "coach")) {
        const isStopping =
          monitoredId === agentId && monitoredEngagementId === uii;
        if (isStopping) {
          setMonitoredId(null);
          setMonitoredEngagementId(null);
          flashRef.current(`Stopped monitoring ${row?.fullName ?? agentId}`);
        } else {
          setMonitoredId(agentId);
          setMonitoredEngagementId(uii ?? null);
        }
        return;
      }

      // Digital conversation handled by an AirPro (AI) agent -> open the
      // Interaction preview popup in listening mode (URL-driven).
      if (
        type === "monitor" &&
        row &&
        !row.isVoiceInteraction &&
        row.agentType === "Air"
      ) {
        onPreviewOpen?.(row.engagementId);
        return;
      }

      flashRef.current(
        type === "coach"
          ? "Coaching started"
          : type === "join"
            ? "Joined conversation"
            : "Monitoring interaction",
      );
    },
    [interactions, monitoredId, monitoredEngagementId, onPreviewOpen],
  );

  // 'AI' for Air (AI) agents, 'agent' for human agents — used throughout the
  // takeover wording (modal, banner, hand-back label).
  const takeoverSubject = insightCtx?.agentType === "Air" ? "AI" : "agent";
  const isBarged = Boolean(insightCtx && bargedId === insightCtx.engagementId);

  // Transfer = hand the interaction off. Voice interactions open the dialer's
  // transfer workflow ("Ask first" warm / blind transfer); digital interactions
  // open the "Reassign conversation" modal to pick a new agent.
  const handleTransfer = useCallback(() => {
    if (!insightCtx) return;
    if (insightCtx.isVoice) setTransferOpen(true);
    else setReassignOpen(true);
  }, [insightCtx]);

  // Agents available to receive a reassigned conversation.
  const reassignAgents = useMemo(
    () =>
      (agents as any[]).map((a) => ({
        id: String(a.agentId),
        name: a.fullName as string,
      })),
    [agents],
  );

  // Confirm pause & barge: persist the chosen settings, mark this engagement as
  // taken over, and surface a toast describing the takeover.
  const handleConfirmBarge = useCallback(
    (settings: BargeSettings) => {
      if (!insightCtx) return;
      setBargeSettings(settings);
      try {
        window.localStorage.setItem(
          "eag.bargeSettings",
          JSON.stringify(settings),
        );
      } catch {
        /* ignore blocked storage */
      }
      setBargedId(insightCtx.engagementId);
      setPauseBargeOpen(false);
      const who = settings.anonymous ? "anonymously" : "as supervisor";
      flashRef.current(`You've taken over from ${insightCtx.agentName} (${who})`);
    },
    [insightCtx],
  );

  // Hand the conversation back to the AI / agent.
  const handleHandBack = useCallback(() => {
    if (!insightCtx) return;
    setBargedId(null);
    flashRef.current(`Handed ${insightCtx.agentName} back to the ${takeoverSubject}`);
  }, [insightCtx, takeoverSubject]);

  const onInteractionRollupClick = useCallback((e: any, agentId: string) => {
    const el = e?.currentTarget || e?.target;
    const r = el?.getBoundingClientRect?.();
    setRollup({
      agentId,
      x: r ? Math.min(r.left, window.innerWidth - 320) : 400,
      y: r ? r.bottom + 4 : 200,
    });
  }, []);

  // Clicking the icons in the Agents tab "Active interactions" column jumps to
  // the Interactions tab and blinks that agent's interaction rows. (The rollup
  // number column keeps its own onInteractionRollupClick popover.)
  const onActiveInteractionsIconClick = useCallback(
    (_e: any, agentId: string) => {
      onActiveInteractionsClick?.(agentId);
    },
    [onActiveInteractionsClick],
  );

  const rollupAgent = rollup
    ? (agents.find((x: any) => x.agentId === rollup.agentId) as any)
    : null;

  const stateModalAgent = stateModalAgentId
    ? (agents.find((x: any) => x.agentId === stateModalAgentId) as any)
    : null;

  // Live row backing the open AI Insights panel, so its Sentiment / Confidence
  // track the same (drifting) scores shown in the table for that interaction.
  const insightRow = insightCtx
    ? (interactions.find(
        (r: any) => r.engagementId === insightCtx.engagementId,
      ) as any)
    : null;

  // Interaction row backing the digital "Interaction preview" popup (URL-driven).
  const previewRow = previewEngagementId
    ? (interactions.find(
        (r: any) => r.engagementId === previewEngagementId,
      ) as any)
    : null;

  // Deep link points at an engagement that doesn't exist -> restore the table URL.
  useEffect(() => {
    if (previewEngagementId && !previewRow) onPreviewClose?.();
  }, [previewEngagementId, previewRow, onPreviewClose]);

  const previewData = useMemo(
    () => (previewRow ? makeInteractionPreview(previewRow) : null),
    [previewRow],
  );

  // Take over availability tracks the AI agent's lifecycle: a draining agent
  // (Pending Inactive) can't accept a take-over hand-off.
  const previewAgent = previewRow
    ? (agents.find((a: any) => a.agentId === previewRow.agentId) as any)
    : null;
  const previewAgentPendingInactive = Boolean(
    previewAgent &&
      (previewAgent.agentBaseState === "PENDING-INACTIVE" ||
        previewAgent.agentBaseState === "PENDING_INACTIVE" ||
        previewAgent.agentState === "Pending Inactive"),
  );

  const handlePreviewHandBack = useCallback(() => {
    const name = previewData?.agentName ?? "the agent";
    flashRef.current(`You've handed the conversation back to ${name}`);
    onPreviewClose?.();
  }, [previewData, onPreviewClose]);

  return (
    <RcThemeProvider>
      <ThemeProvider theme={theme as any}>
        <div
          style={{
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {previewRow && previewData && previewMode === "takeover" ? (
            // Take-over renders embedded in place of the table (the page shows
            // a "← Supervisor" back row above this panel).
            <InteractionPreview
              mode="takeover"
              data={previewData}
              takeOverDisabled={previewAgentPendingInactive}
              onClose={() => onPreviewClose?.()}
              onEnlarge={() => onPreviewModeChange?.("expanded")}
              onTakeOver={() => onPreviewModeChange?.("takeover")}
              onHandBack={handlePreviewHandBack}
            />
          ) : activeTab === "Interactions" ? (
            <DigitalInteractionTable
              columns={visibleInteractionCols as any}
              digitalTaskList={displayInteractions as any}
              monitorAgentCallback={monitorInteractionCallback}
              monitoredAgent={
                {
                  // Voice monitoring (dialpad) takes precedence; otherwise an
                  // open digital Interaction preview highlights its row.
                  monitoredAgentId: monitoredId ?? previewRow?.agentId ?? "",
                  uii: monitoredEngagementId ?? previewEngagementId ?? "",
                } as any
              }
              viewInsight={viewInsightCallback}
              loggedInAgentId={"supervisor"}
              selectedIds={selectedAgentIds}
              selectedChannels={selectedChannels}
              selectedCategories={selectedCategories}
              searchValue={searchValue}
              highlightAgentId={highlightAgentId}
              highlightNonce={highlightNonce}
              selectedEngagementId={insightCtx?.engagementId ?? null}
              shouldShowViewInsightsButton={true}
              AgentSvc={{ digitalAgentEnabled: true } as any}
              FeatureFlagsSvc={{ featureFlags: {} } as any}
              aiNotesFeatures={[] as any}
            />
          ) : (
            <SupervisorAgentList
              agentList={displayAgents as any}
              columns={visibleAgentCols as any}
              onInteractionsClick={onActiveInteractionsIconClick}
              onInteractionRollupClick={onInteractionRollupClick}
              callTotalsLoading={false}
              loggedInAgentId={"supervisor"}
              onLogOut={onLogOut}
              monitorAgentCallback={monitorAgentCallback}
              monitoredAgent={
                { monitoredAgentId: monitoredId ?? "", uii: "" } as any
              }
              selectedChannels={selectedChannels}
              selectedStates={selectedStates}
              searchValue={searchValue}
              changeAgentState={changeAgentState}
            />
          )}

          {insightCtx && (
            <AiInsightsPanel
              agentName={insightCtx.agentName}
              isVoice={insightCtx.isVoice}
              sentimentScore={insightRow?.sentimentScore ?? null}
              confidenceScore={insightRow?.confidenceScore ?? null}
              isBarged={isBarged}
              takeoverSubject={takeoverSubject}
              onTransfer={handleTransfer}
              onTakeOver={() => setPauseBargeOpen(true)}
              onHandBack={handleHandBack}
              onClose={() => setInsightCtx(null)}
            />
          )}
        </div>

        {previewRow && previewData && previewMode && previewMode !== "takeover" && (
          <InteractionPreview
            mode={previewMode}
            data={previewData}
            takeOverDisabled={previewAgentPendingInactive}
            takeOverDisabledTooltip={
              previewAgentPendingInactive
                ? "You can't take over right now. This AirPro agent is pending inactive."
                : undefined
            }
            onClose={() => onPreviewClose?.()}
            onEnlarge={() => onPreviewModeChange?.("expanded")}
            onTakeOver={() => onPreviewModeChange?.("takeover")}
            onHandBack={handlePreviewHandBack}
          />
        )}

        {insightCtx && pauseBargeOpen && (
          <PauseBargeModal
            agentName={insightCtx.agentName}
            subject={takeoverSubject}
            isVoice={insightCtx.isVoice}
            initial={bargeSettings}
            onCancel={() => setPauseBargeOpen(false)}
            onConfirm={handleConfirmBarge}
          />
        )}

        {insightCtx && transferOpen && (
          <div
            onClick={() => setTransferOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 9998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            data-testid="overlay-transfer"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Dialer
                initialView="transfer"
                manageCallMode="v2"
                style={{
                  minHeight: 0,
                  width: "auto",
                  background: "transparent",
                  padding: 0,
                }}
                onToast={(t) =>
                  flashRef.current(
                    t.description ? `${t.title} — ${t.description}` : t.title,
                  )
                }
                onTransferComplete={() => setTransferOpen(false)}
                onCallEnd={() => setTransferOpen(false)}
              />
            </div>
          </div>
        )}

        {monitoredAgentRow && (
          <MonitoringDialpad
            key={monitoredAgentRow.agentId}
            agentName={monitoredAgentRow.fullName}
            agentType={monitoredAgentRow.agentType === "Air" ? "Air" : "Human"}
            onClose={stopMonitoring}
            onToast={(m) => flashRef.current(m)}
          />
        )}

        {insightCtx && reassignOpen && (
          <ReassignConversationModal
            agents={reassignAgents}
            onCancel={() => setReassignOpen(false)}
            onSave={(agent) => {
              setReassignOpen(false);
              flashRef.current(`Conversation reassigned to ${agent.name}`);
            }}
          />
        )}

        {rollup && rollupAgent && (
          <>
            <div
              onClick={() => setRollup(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 9997,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 300,
                background: "#fff",
                border: "1px solid #E0E0E0",
                borderRadius: 8,
                boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                zIndex: 9998,
                padding: "14px 16px",
              }}
            >
              <InteractionRollupModal
                rollupData={rollupAgent.rollupBreakdown as any}
                rollupColumns={rollupColumns as any}
                total={rollupAgent.interactions24hRollupTotalCount as any}
                agentName={rollupAgent.fullName}
                onClose={() => setRollup(null)}
              />
            </div>
          </>
        )}

        {stateModalAgent && (
          <UpdateAgentStateModal
            agentName={stateModalAgent.fullName}
            agentType={stateModalAgent.agentType}
            onCancel={() => setStateModalAgentId(null)}
            onUpdate={applyAgentState}
          />
        )}

        {successToast && (
          <AgentStateToast
            message={successToast}
            onClose={() => setSuccessToast(null)}
          />
        )}

        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#212121",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              zIndex: 9999,
            }}
          >
            {toast}
          </div>
        )}
      </ThemeProvider>
    </RcThemeProvider>
  );
}
