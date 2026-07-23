import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute, useSearch } from "wouter";

// Kept in sync with the proto InteractionPreview component's mode union.
// (Declared locally so this page doesn't pull the excluded proto tree into tsc.)
type InteractionPreviewMode = "preview" | "expanded" | "takeover";

import AgentTablePanel, {
  ActiveCallView,
  agentColumnMeta,
  interactionColumnMeta,
  agentStateOptions,
  interactionFilterMeta,
  SupervisorFilter,
} from "@proto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ChevronDown,
  ListFilter,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ExternalLink,
  Menu as DragHandleIcon,
  X,
} from "lucide-react";

// The header/tabs/Filters blue, reused in the table settings dialogs so the
// whole page shares one accent color.
const RC_BLUE = "#066fac";

// Mirrors CATEGORIES_MAP in client/src/proto/eag/helpers/injector. The id is
// what the interactions table filters on (categoryIds), the label is shown.
const CATEGORY_OPTIONS = [
  { id: "1", label: "Billing" },
  { id: "2", label: "Refund" },
  { id: "3", label: "Technical" },
  { id: "4", label: "VIP" },
  { id: "5", label: "Escalation" },
  { id: "6", label: "Feedback" },
];

// Shared agent-type options, used on both the Agents and Interactions tabs.
const AGENT_TYPE_OPTIONS = [
  { value: "Air", label: "AirPro agents" },
  { value: "Human", label: "Human agents" },
];

const CHANNEL_OPTIONS = [
  "Web Chat",
  "Support Inbox",
  "Twitter",
  "Facebook",
  "Instagram",
  "WhatsApp",
  "SMS",
  "Voice",
];

const topTabs = [
  "Active calls",
  "Active messages",
  "All messages",
  "History",
  "Callbacks",
  "Scripts",
  "Stats",
  "Supervisor",
];

const supervisorFilters = ["Agents", "Interactions"];

const sidePrimaryNav = [
  {
    label: "Message",
    icon: "/figmaAssets/icon-bubble-lines-border.svg",
    active: false,
    badge: "6",
  },
  {
    label: "Video",
    icon: "/figmaAssets/icon-videocam-border.svg",
    active: false,
  },
  {
    label: "Phone",
    icon: "/figmaAssets/icon-phone-border.svg",
    active: false,
  },
  {
    label: "Agent",
    icon: "/figmaAssets/icon-engage-border-1.svg",
    active: true,
  },
  {
    label: "Contacts",
    icon: "/figmaAssets/phone-inbox-border-1.svg",
    active: false,
  },
  {
    label: "More",
    icon: "/figmaAssets/icon-more-horiz.svg",
    active: false,
  },
];

const sideSecondaryNav = [
  {
    label: "Apps",
    icon: "/figmaAssets/icon-default-integration-border.svg",
  },
  {
    label: "Settings",
    icon: "/figmaAssets/icon-settings-border.svg",
  },
  {
    label: "Help",
    icon: "/figmaAssets/icon-help-border.svg",
  },
];

interface SupervisorAgentsProps {
  // When set, the tab is pinned (used by the design-canvas artboards so each
  // frame stays frozen on its own tab instead of following the live URL).
  fixedTab?: "Agents" | "Interactions";
  // Injected by wouter when this page is used as a <Route component>; the page
  // reads route state via hooks instead, so this is unused.
  params?: Record<string, string | undefined>;
}

export const SupervisorAgents = ({
  fixedTab,
}: SupervisorAgentsProps = {}): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  // All filter states are string arrays — empty array means "no filter" (show all).
  const [agentTypeFilter, setAgentTypeFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  // Interactions-tab agent picker — empty = show all agents.
  const [agentFilter, setAgentFilter] = useState<string[]>([]);

  // The filter row is closed by default; the "Filters" button toggles it open.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Interactions-tab filters (channel is shared with the Agents tab).
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // URL-driven tab state (deep-linkable): Interactions is the default landing
  // tab (clean URL, no param); the Agents tab is addressable via ?tab=agents.
  const search = useSearch();
  const [pathname, navigate] = useLocation();

  // URL-addressable digital "Interaction preview" (deep-linkable / refresh-safe):
  // /interactions/:engagementId/:mode with mode preview | expanded | takeover.
  const [previewRouteMatched, previewParams] = useRoute(
    "/interactions/:engagementId/:mode",
  );
  const rawPreviewMode = previewRouteMatched ? previewParams?.mode : null;
  const previewMode: InteractionPreviewMode | null =
    rawPreviewMode === "preview" ||
    rawPreviewMode === "expanded" ||
    rawPreviewMode === "takeover"
      ? rawPreviewMode
      : null;
  const previewEngagementId =
    previewRouteMatched && previewMode
      ? (previewParams?.engagementId ?? null)
      : null;

  // Unknown mode in the URL -> restore the plain table URL.
  useEffect(() => {
    if (previewRouteMatched && !previewMode) navigate("/");
  }, [previewRouteMatched, previewMode, navigate]);

  // URL-addressable Active calls view (deep-linkable / refresh-safe): after a
  // voice take-over commits, the page routes to /active-call/:agentId and the
  // top tab bar switches from "Supervisor" to "Active calls".
  const [activeCallMatched, activeCallParams] = useRoute(
    "/active-call/:agentId",
  );
  const activeCallAgentId = activeCallMatched
    ? (activeCallParams?.agentId ?? null)
    : null;

  const handleTakeOverCommitted = useCallback(
    (agentId: string) => navigate(`/active-call/${agentId}`),
    [navigate],
  );

  // Closing the taken-over call window ends the Active calls context — the
  // top tab bar returns to Supervisor automatically.
  const handleMonitoringWindowClosed = useCallback(
    (agentId: string) => {
      if (activeCallMatched && agentId === activeCallAgentId) navigate("/");
    },
    [activeCallMatched, activeCallAgentId, navigate],
  );

  // The top tab bar is URL-driven: the Active calls tab is active while the
  // take-over route is open; clicking Supervisor returns to the table. Other
  // top tabs are static chrome in this prototype.
  const topTab = activeCallMatched ? "Active calls" : "Supervisor";
  const handleTopTabChange = useCallback(
    (value: string) => {
      if (value === "Supervisor" && activeCallMatched) navigate("/");
    },
    [navigate, activeCallMatched],
  );

  // A preview deep link always belongs to the Interactions tab (preview URLs
  // never carry ?tab=agents, so the URL-derived tab is already Interactions).
  const activeTab: "Agents" | "Interactions" =
    fixedTab ??
    (!previewRouteMatched && new URLSearchParams(search).get("tab") === "agents"
      ? "Agents"
      : "Interactions");
  const isInteractions = activeTab === "Interactions";

  const setActiveTab = useCallback(
    (value: "Agents" | "Interactions") => {
      // Canvas artboards are pinned to a tab — ignore tab-change attempts so
      // the two frames never drift off their frozen states.
      if (fixedTab) return;
      const params = new URLSearchParams(window.location.search);
      if (value === "Agents") {
        params.set("tab", "agents");
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      // Leaving from a preview deep link returns to the plain table URL.
      const base = previewRouteMatched ? "/" : pathname;
      navigate(qs ? `${base}?${qs}` : base);
    },
    [navigate, pathname, previewRouteMatched, fixedTab],
  );

  const openPreview = useCallback(
    (engagementId: string) =>
      navigate(`/interactions/${engagementId}/preview`),
    [navigate],
  );
  const changePreviewMode = useCallback(
    (mode: InteractionPreviewMode) => {
      if (previewEngagementId) {
        navigate(`/interactions/${previewEngagementId}/${mode}`);
      }
    },
    [previewEngagementId, navigate],
  );
  const closePreview = useCallback(() => navigate("/"), [navigate]);

  // When the supervisor clicks an agent's "Active interactions" icons we jump to
  // the Interactions tab and blink that agent's rows. The nonce re-triggers the
  // blink animation even if the same agent is clicked again. (Blink highlight is
  // transient feedback, so it stays local rather than in the URL.)
  const [highlightAgentId, setHighlightAgentId] = useState<string | null>(null);
  const [highlightNonce, setHighlightNonce] = useState(0);

  const handleActiveInteractionsClick = useCallback(
    (agentId: string) => {
      setActiveTab("Interactions");
      setHighlightAgentId(agentId);
      setHighlightNonce((n) => n + 1);
    },
    [setActiveTab],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      // setActiveTab already routes back to the plain table URL when a preview
      // deep link is open, so switching tabs also closes the preview.
      setActiveTab(value as "Agents" | "Interactions");
      // Manually changing tabs clears any agent-driven row highlight.
      setHighlightAgentId(null);
    },
    [setActiveTab],
  );

  // State options constrained by the selected agent types. Empty selection shows
  // the union of all states. Selecting one type shows only that type's states.
  const stateOptionsForType = useMemo(() => {
    if (agentTypeFilter.length === 0) return agentStateOptions.All;
    return Array.from(
      new Set(
        agentTypeFilter.flatMap(
          (t) => agentStateOptions[t as "Air" | "Human"] ?? [],
        ),
      ),
    );
  }, [agentTypeFilter]);

  // Agent-type filter (shared by both tabs). Changing it drops any state
  // selections that are no longer valid for the new type set.
  const handleAgentTypeChange = useCallback((values: string[]) => {
    setAgentTypeFilter(values);
    if (values.length > 0) {
      const validStates = new Set(
        values.flatMap((t) => agentStateOptions[t as "Air" | "Human"] ?? []),
      );
      setStateFilter((prev) => prev.filter((s) => validStates.has(s)));
    }
    // If no types selected all states are valid — keep existing state selections.
  }, []);

  // ---- Interactions-tab cascading filters ------------------------------
  // Order: Agent type -> Agents -> Channels -> Categories. Each option set is
  // derived from the interaction rows that match every upstream selection, and
  // selections invalidated by an upstream change are pruned.
  const rowsForTypes = useCallback(
    (types: string[]) =>
      interactionFilterMeta.filter(
        (r) => types.length === 0 || types.includes(r.agentType),
      ),
    [],
  );

  const interactionAgentOptions = useMemo(() => {
    const rows = rowsForTypes(agentTypeFilter);
    return Array.from(
      new Map(rows.map((r) => [r.agentId, r.fullName])).entries(),
    ).map(([value, label]) => ({ value, label }));
  }, [agentTypeFilter, rowsForTypes]);

  const interactionChannelOptions = useMemo(() => {
    const rows = rowsForTypes(agentTypeFilter).filter(
      (r) => agentFilter.length === 0 || agentFilter.includes(r.agentId),
    );
    return Array.from(new Set(rows.map((r) => r.sourceName)));
  }, [agentTypeFilter, agentFilter, rowsForTypes]);

  const interactionCategoryOptions = useMemo(() => {
    const rows = rowsForTypes(agentTypeFilter)
      .filter(
        (r) => agentFilter.length === 0 || agentFilter.includes(r.agentId),
      )
      .filter(
        (r) =>
          channelFilter.length === 0 || channelFilter.includes(r.sourceName),
      );
    const ids = new Set(rows.flatMap((r) => r.categoryIds));
    return CATEGORY_OPTIONS.filter((c) => ids.has(c.id));
  }, [agentTypeFilter, agentFilter, channelFilter, rowsForTypes]);

  // Prunes every downstream selection so it stays valid for the given
  // upstream state, then commits all three downstream filters.
  const pruneInteractionDownstream = useCallback(
    (types: string[], agents: string[], channels: string[], cats: string[]) => {
      const rows1 = rowsForTypes(types);
      const validAgents = new Set(rows1.map((r) => r.agentId));
      const nextAgents = agents.filter((a) => validAgents.has(a));
      const rows2 = rows1.filter(
        (r) => nextAgents.length === 0 || nextAgents.includes(r.agentId),
      );
      const validChannels = new Set(rows2.map((r) => r.sourceName));
      const nextChannels = channels.filter((c) => validChannels.has(c));
      const rows3 = rows2.filter(
        (r) =>
          nextChannels.length === 0 || nextChannels.includes(r.sourceName),
      );
      const validCats = new Set(rows3.flatMap((r) => r.categoryIds));
      setAgentFilter(nextAgents);
      setChannelFilter(nextChannels);
      setCategoryFilter(cats.filter((c) => validCats.has(c)));
    },
    [rowsForTypes],
  );

  const handleInteractionsAgentTypeChange = useCallback(
    (values: string[]) => {
      handleAgentTypeChange(values);
      pruneInteractionDownstream(
        values,
        agentFilter,
        channelFilter,
        categoryFilter,
      );
    },
    [
      handleAgentTypeChange,
      pruneInteractionDownstream,
      agentFilter,
      channelFilter,
      categoryFilter,
    ],
  );

  const handleInteractionsAgentChange = useCallback(
    (values: string[]) => {
      pruneInteractionDownstream(
        agentTypeFilter,
        values,
        channelFilter,
        categoryFilter,
      );
    },
    [
      pruneInteractionDownstream,
      agentTypeFilter,
      channelFilter,
      categoryFilter,
    ],
  );

  const handleInteractionsChannelChange = useCallback(
    (values: string[]) => {
      pruneInteractionDownstream(
        agentTypeFilter,
        agentFilter,
        values,
        categoryFilter,
      );
    },
    [pruneInteractionDownstream, agentTypeFilter, agentFilter, categoryFilter],
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(agentColumnMeta.map((c) => [c.id, true])),
  );
  const [visibleInteractionCols, setVisibleInteractionCols] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(interactionColumnMeta.map((c) => [c.id, true])));
  const [colOrder, setColOrder] = useState<string[]>(() =>
    agentColumnMeta.map((c) => c.id),
  );
  const [draftCols, setDraftCols] = useState<Record<string, boolean>>(
    visibleCols,
  );
  const [draftOrder, setDraftOrder] = useState<string[]>(colOrder);
  const [dragId, setDragId] = useState<string | null>(null);

  const lockedColId = isInteractions ? "sourceName" : "fullName";
  const activeVisibleCols = isInteractions ? visibleInteractionCols : visibleCols;

  const colLabelById = Object.fromEntries(
    agentColumnMeta.map((c) => [c.id, c.label]),
  );

  const openSettings = (open: boolean) => {
    if (open) {
      setDraftCols(activeVisibleCols);
      setDraftOrder(colOrder);
    }
    setSettingsOpen(open);
  };

  // Reorders draftOrder by moving fromId to the slot occupied by toId. The locked
  // Agent (fullName) column stays pinned first and cannot be dragged or displaced.
  const moveColumn = (fromId: string, toId: string) => {
    if (fromId === toId || fromId === "fullName" || toId === "fullName") return;
    setDraftOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(fromId);
      const to = next.indexOf(toId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, fromId);
      return next;
    });
  };

  // Arrays are now the direct filter state — pass through unchanged.
  const selectedStates = stateFilter;
  const selectedChannels = channelFilter;
  const selectedCategories = categoryFilter;
  const selectedAgentIds = agentFilter;
  // Order matters: columns render in the saved drag order, Agent column first.
  const visibleColumnIds = colOrder.filter(
    (id) => id === "fullName" || visibleCols[id],
  );
  const visibleInteractionColumnIds = interactionColumnMeta
    .filter((c) => c.id === "sourceName" || visibleInteractionCols[c.id])
    .map((c) => c.id);

  // The settings dialog lists agent columns in their draggable saved order and
  // interaction columns in their fixed order (drag-reorder is agent-only).
  const dialogColumnOrder = isInteractions
    ? interactionColumnMeta.map((c) => c.id)
    : draftOrder;
  const dialogLabelById = isInteractions
    ? Object.fromEntries(interactionColumnMeta.map((c) => [c.id, c.label]))
    : colLabelById;
  const dragEnabled = !isInteractions;

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <header
        data-name="App bar"
        className="flex h-14 w-full shrink-0 items-center border-b border-[#0000001f] bg-white"
      >
        <div className="relative flex h-full w-full items-center bg-[url('/figmaAssets/appbar-bg.svg')] bg-cover bg-center px-4 pl-5">
          <div className="flex items-center gap-4">
            <button type="button" className="relative">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                <img
                  className="h-full w-full object-cover"
                  alt="Image"
                  src="/figmaAssets/image-1-1.png"
                />
              </div>
              <img
                className="absolute bottom-0 right-0 h-3.5 w-3.5"
                alt="Presence"
                src="/figmaAssets/presence.svg"
              />
            </button>
            <h1 className="font-headline-2 text-[length:var(--headline-2-font-size)] font-[number:var(--headline-2-font-weight)] leading-[var(--headline-2-line-height)] tracking-[var(--headline-2-letter-spacing)] text-headertext [font-style:var(--headline-2-font-style)]">
              RingCentral, Inc.
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full bg-[#ffffff29] p-0 hover:bg-[#ffffff40]"
              >
                <img
                  className="h-4 w-4"
                  alt="Icon chevron left"
                  src="/figmaAssets/icon-chevron-left.svg"
                />
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full bg-[#ffffff14] p-0 hover:bg-[#ffffff29]"
              >
                <img
                  className="h-4 w-4"
                  alt="Icon chevron right"
                  src="/figmaAssets/icon-chevron-right.svg"
                />
              </Button>
            </div>
          </div>
          <div className="flex flex-1 px-2 pl-3 pr-3">
            <div className="relative w-full max-w-[468px]">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[#ffffff29]" />
              <div className="relative flex h-8 items-center gap-2 px-3">
                <img
                  className="h-4 w-4"
                  alt="Icon search nav"
                  src="/figmaAssets/icon-search-nav.svg"
                />
                <span className="font-button text-[length:var(--button-font-size)] font-[number:var(--button-font-weight)] leading-[var(--button-line-height)] tracking-[var(--button-letter-spacing)] text-headertexthint [font-style:var(--button-font-style)]">
                  Search
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-[164px] items-center gap-1 rounded-2xl bg-white px-3"
            >
              <img
                className="h-3.5 w-3.5"
                alt="Presence"
                src="/figmaAssets/presence.svg"
              />
              <img
                className="h-4 w-4"
                alt="Icon engage border"
                src="/figmaAssets/icon-engage-border.svg"
              />
              <div className="flex flex-1 items-center justify-between gap-1">
                <span className="font-caption-1 text-[length:var(--caption-1-font-size)] font-[number:var(--caption-1-font-weight)] leading-[var(--caption-1-line-height)] tracking-[var(--caption-1-letter-spacing)] text-[#121212] [font-style:var(--caption-1-font-style)]">
                  Available
                </span>
                <span className="whitespace-nowrap font-caption-1 text-[length:var(--caption-1-font-size)] font-[number:var(--caption-1-font-weight)] leading-[var(--caption-1-line-height)] tracking-[var(--caption-1-letter-spacing)] text-[#121212] [font-style:var(--caption-1-font-style)]">
                  21:01
                </span>
              </div>
              <img
                className="h-4 w-4"
                alt="Icon arrow down"
                src="/figmaAssets/icon-arrow-down.svg"
              />
            </button>
            <Button
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white p-0 shadow-none hover:bg-white"
            >
              <img
                className="h-4 w-4"
                alt="Icon dialer s"
                src="/figmaAssets/icon-dialer-s.svg"
              />
            </Button>
            <Button
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white p-0 shadow-none hover:bg-white"
            >
              <img
                className="h-4 w-4"
                alt="Icon call add"
                src="/figmaAssets/icon-call-add.svg"
              />
            </Button>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          data-name="Side nav"
          className="flex w-20 shrink-0 flex-col justify-between border-r border-neutral-200 bg-navb-02 py-4"
        >
          <nav className="flex flex-col">
            {sidePrimaryNav.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`relative flex min-h-10 w-20 flex-col items-center justify-center px-0 py-[5px] ${
                  item.active ? "bg-[#066fac1f]" : ""
                }`}
              >
                <img className="relative" alt={item.label} src={item.icon} />
                <span
                  className={`mt-0.5 flex h-4 items-center justify-center self-stretch text-center font-caption-2 text-[length:var(--caption-2-font-size)] font-[number:var(--caption-2-font-weight)] leading-[var(--caption-2-line-height)] tracking-[var(--caption-2-letter-spacing)] [font-style:var(--caption-2-font-style)] ${
                    item.active ? "text-[#066fac]" : "text-[#121212]"
                  }`}
                >
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="absolute right-[22px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#ff8800] font-caption-1 text-[length:var(--caption-1-font-size)] font-[number:var(--caption-1-font-weight)] leading-[var(--caption-1-line-height)] tracking-[var(--caption-1-letter-spacing)] text-white [font-style:var(--caption-1-font-style)]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <nav className="flex flex-col">
            {sideSecondaryNav.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex min-h-10 w-20 flex-col items-center justify-center px-0 py-[5px]"
              >
                <img className="relative" alt={item.label} src={item.icon} />
                <span
                  className={`mt-0.5 flex h-4 items-center justify-center self-stretch text-center ${
                    item.label === "Help"
                      ? "[font-family:'Lato',Helvetica] text-xs font-bold leading-4 tracking-[0]"
                      : "font-caption-2 text-[length:var(--caption-2-font-size)] font-[number:var(--caption-2-font-weight)] leading-[var(--caption-2-line-height)] tracking-[var(--caption-2-letter-spacing)] [font-style:var(--caption-2-font-style)]"
                  } text-[#121212]`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-neutral-200 bg-white">
            <div className="flex h-[60px] items-center px-3 py-0.5">
              <div className="flex flex-1 items-center gap-2 pr-3">
                <span className="font-descriptor-mini text-[length:var(--descriptor-mini-font-size)] font-[number:var(--descriptor-mini-font-weight)] leading-[var(--descriptor-mini-line-height)] tracking-[var(--descriptor-mini-letter-spacing)] text-neutralf-06 [font-style:var(--descriptor-mini-font-style)]">
                  RingCX Agent
                </span>
              </div>
              <Button
                variant="ghost"
                className="h-8 rounded-2xl px-3 shadow-none hover:bg-[#66666614]"
              >
                <img
                  className="mr-1 h-4 w-4"
                  alt="Icon"
                  src="/figmaAssets/--icon.svg"
                />
                <span className="font-descriptor-mini text-[length:var(--descriptor-mini-font-size)] font-[number:var(--descriptor-mini-font-weight)] leading-[var(--descriptor-mini-line-height)] tracking-[var(--descriptor-mini-letter-spacing)] text-[#666666] [font-style:var(--descriptor-mini-font-style)]">
                  Session info
                </span>
              </Button>
              <Separator
                orientation="vertical"
                className="ml-3 mr-2 h-4 bg-neutral-200"
              />
              <Button variant="ghost" className="h-8 w-8 p-0 shadow-none">
                <img
                  className="h-4 w-4"
                  alt="Icon help border"
                  src="/figmaAssets/icon-help-border.svg"
                />
              </Button>
            </div>
            <Tabs value={topTab} onValueChange={handleTopTabChange} className="w-full">
              <TabsList className="h-auto justify-start rounded-none border-0 bg-transparent p-0">
                {topTabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent px-3 py-1.5 font-descriptor-mini text-[length:var(--descriptor-mini-font-size)] font-[number:var(--descriptor-mini-font-weight)] leading-[var(--descriptor-mini-line-height)] tracking-[var(--descriptor-mini-letter-spacing)] text-[#121212] shadow-none ring-offset-0 [font-style:var(--descriptor-mini-font-style)] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:border-[#066fac] data-[state=active]:bg-transparent data-[state=active]:text-[#066fac] data-[state=active]:shadow-none"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {activeCallMatched ? null : previewMode === "takeover" ? (
            // Embedded take-over: the Supervisor header/filters give way to a
            // back row, and the taken-over conversation fills the area below.
            <div
              className="flex shrink-0 items-center border-b border-[#0000001a] px-4 py-2.5"
              data-testid="row-takeover-back"
            >
              <button
                type="button"
                onClick={closePreview}
                className="flex items-center gap-2 font-['Roboto',sans-serif] text-[15px] font-medium tracking-[0.15px] text-[#066fac] transition-opacity hover:opacity-80 focus-visible:underline focus-visible:outline-none"
                data-testid="button-back-supervisor"
              >
                <ArrowLeft className="h-4 w-4" />
                Supervisor
              </button>
            </div>
          ) : (
          <>
          <div
            data-name="Supervisor toolbar"
            className="relative flex shrink-0 items-center border-b border-[#0000001a] px-5 py-3"
          >
            <h2 className="shrink-0 font-subtitle-mini text-[15px] font-semibold leading-[var(--subtitle-mini-line-height)] text-[#121212]">
              Supervisor
            </h2>
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-auto"
              >
                <TabsList className="h-10 items-stretch gap-0 rounded-[4px] bg-[#f9f9f9] p-1">
                  {supervisorFilters.map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="h-full w-[148px] rounded-[4px] px-6 font-['Roboto',sans-serif] text-[14px] tracking-[0.15px] text-[#212121] shadow-none ring-offset-0 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-white data-[state=active]:font-medium data-[state=active]:text-[#212121] data-[state=active]:shadow-[0px_2px_3px_0px_rgba(173,173,173,0.2)] data-[state=inactive]:bg-transparent data-[state=inactive]:font-normal data-[state=inactive]:text-[#212121]"
                      data-testid={`tab-supervisor-${tab.toLowerCase()}`}
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative w-[500px]">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a1a1a1]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-[4px] border-[#e0e0e0] pl-11 pr-[96px] font-['Roboto',sans-serif] text-[14px] tracking-[0.25px] text-[#212121] placeholder:text-[#a1a1a1]"
                  placeholder={
                    isInteractions ? "Search interactions" : "Search agents"
                  }
                  data-testid="input-search"
                />
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-pressed={filtersOpen}
                  className={`absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.15px] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline ${filtersOpen ? "text-[#066fac]" : "text-[#666666]"}`}
                  data-testid="button-filters"
                >
                  <ListFilter className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>
            <Button
              variant="ghost"
              aria-label="Table settings"
              onClick={() => openSettings(true)}
              className="ml-auto h-10 w-10 rounded-full p-0 text-[#666666] shadow-none hover:bg-[#66666614]"
              data-testid="button-settings"
            >
              <SettingsIcon className="h-6 w-6" />
            </Button>
          </div>
          {filtersOpen && (
            <div
              className="flex shrink-0 items-center gap-3 border-b border-[#0000001a] bg-white px-5 py-3"
              data-testid="filter-row"
            >
              {/* Agents tab: Channel, Agent type, State (State options constrained
                  by the selected Agent types). */}
              {!isInteractions && (
                <>
                  <SupervisorFilter
                    values={channelFilter}
                    onValuesChange={handleInteractionsChannelChange}
                    placeholder="All channels"
                    options={CHANNEL_OPTIONS.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    testId="select-channel"
                  />
                  <SupervisorFilter
                    values={agentTypeFilter}
                    onValuesChange={handleInteractionsAgentTypeChange}
                    placeholder="All agent types"
                    options={AGENT_TYPE_OPTIONS}
                    testId="select-agent-type"
                  />
                  <SupervisorFilter
                    values={stateFilter}
                    onValuesChange={setStateFilter}
                    placeholder="All states"
                    options={stateOptionsForType.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    testId="select-state"
                  />
                </>
              )}
              {/* Interactions tab: Agent type -> Agents -> Channels ->
                  Categories. Each filter's options cascade from the upstream
                  selections, and invalidated selections are pruned. */}
              {isInteractions && (
                <>
                  <SupervisorFilter
                    values={agentTypeFilter}
                    onValuesChange={handleInteractionsAgentTypeChange}
                    placeholder="All agent types"
                    options={AGENT_TYPE_OPTIONS}
                    testId="select-agent-type"
                  />
                  <SupervisorFilter
                    values={agentFilter}
                    onValuesChange={handleInteractionsAgentChange}
                    placeholder="All agents"
                    options={interactionAgentOptions}
                    testId="select-agent"
                  />
                  <SupervisorFilter
                    values={channelFilter}
                    onValuesChange={handleInteractionsChannelChange}
                    placeholder="All channels"
                    options={interactionChannelOptions.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    testId="select-channel"
                  />
                  <SupervisorFilter
                    values={categoryFilter}
                    onValuesChange={setCategoryFilter}
                    placeholder="All categories"
                    options={interactionCategoryOptions.map((c) => ({
                      value: c.id,
                      label: c.label,
                    }))}
                    testId="select-category"
                  />
                </>
              )}
            </div>
          )}
          </>
          )}
          {activeCallMatched ? (
            // Active calls view for the taken-over voice call. The supervisor
            // table below stays mounted (zero-height) so the floating take-over
            // dialer window and monitoring session survive the tab switch.
            <div className="min-h-0 flex-1 overflow-hidden">
              <ActiveCallView agentId={activeCallAgentId} />
            </div>
          ) : null}
          <div
            data-name={
              isInteractions ? "Interaction table" : "Agent table"
            }
            className={
              activeCallMatched
                ? "h-0 overflow-hidden"
                : "min-h-0 flex-1 overflow-hidden"
            }
          >
            <AgentTablePanel
              activeTab={activeTab}
              searchValue={searchQuery}
              selectedStates={selectedStates}
              selectedChannels={selectedChannels}
              agentTypeFilter={agentTypeFilter}
              visibleColumnIds={visibleColumnIds}
              selectedAgentIds={selectedAgentIds}
              selectedCategories={selectedCategories}
              visibleInteractionColumnIds={visibleInteractionColumnIds}
              onActiveInteractionsClick={handleActiveInteractionsClick}
              highlightAgentId={highlightAgentId}
              highlightNonce={highlightNonce}
              previewEngagementId={previewEngagementId}
              previewMode={previewMode}
              onPreviewOpen={openPreview}
              onPreviewModeChange={changePreviewMode}
              onPreviewClose={closePreview}
              onTakeOverCommitted={handleTakeOverCommitted}
              onMonitoringWindowClosed={handleMonitoringWindowClosed}
            />
          </div>

          <Dialog open={settingsOpen} onOpenChange={openSettings}>
            <DialogContent
              className="max-w-3xl gap-0 p-0"
              data-testid="dialog-settings"
            >
              <DialogHeader className="px-8 pt-7">
                <DialogTitle
                  className="text-2xl font-semibold"
                  style={{ color: RC_BLUE }}
                >
                  {isInteractions
                    ? "Interactions table settings"
                    : "Agent table settings"}
                </DialogTitle>
              </DialogHeader>
              <div className="px-8 pb-2 pt-4">
                <p className="mb-5 text-[15px] text-[#121212]">
                  For more information visit{" "}
                  <a
                    href="https://support.ringcentral.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium"
                    style={{ color: RC_BLUE }}
                    data-testid="link-support"
                  >
                    RingCentral Support
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </p>
                {!isInteractions && (
                  <p className="mb-3 text-[13px] text-[#666666]">
                    Drag the handle to reorder columns. Changes apply to the
                    table when you save.
                  </p>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {dialogColumnOrder.map((colId) => {
                    const locked = colId === lockedColId;
                    const checked = locked ? true : !!draftCols[colId];
                    const dragging = dragId === colId;
                    return (
                      <label
                        key={colId}
                        htmlFor={`col-${colId}`}
                        draggable={dragEnabled && !locked}
                        onDragStart={() => {
                          if (dragEnabled && !locked) setDragId(colId);
                        }}
                        onDragOver={(e) => {
                          if (dragEnabled && !locked && dragId) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragId) moveColumn(dragId, colId);
                          setDragId(null);
                        }}
                        onDragEnd={() => setDragId(null)}
                        className={`flex items-center justify-between gap-2 rounded-md bg-[#f4f5f7] px-3 py-2.5 text-[15px] transition-opacity ${
                          locked
                            ? "cursor-default text-[#9aa0a6]"
                            : "cursor-pointer text-[#121212]"
                        } ${dragging ? "opacity-40 ring-2 ring-[#066fac]" : ""}`}
                        data-testid={`col-row-${colId}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Checkbox
                            id={`col-${colId}`}
                            checked={checked}
                            disabled={locked}
                            onCheckedChange={(value) =>
                              setDraftCols((prev) => ({
                                ...prev,
                                [colId]: value === true,
                              }))
                            }
                            className={`h-5 w-5 rounded border-[#c4c8cd] disabled:opacity-100 ${
                              locked
                                ? "data-[state=checked]:border-[#aeb3ba] data-[state=checked]:bg-[#aeb3ba]"
                                : "data-[state=checked]:border-[#066fac] data-[state=checked]:bg-[#066fac]"
                            }`}
                            data-testid={`checkbox-col-${colId}`}
                          />
                          <span className="truncate">
                            {dialogLabelById[colId]}
                          </span>
                        </span>
                        {dragEnabled && (
                          <DragHandleIcon
                            className={`h-4 w-4 shrink-0 text-[#9aa0a6] ${
                              locked ? "" : "cursor-grab active:cursor-grabbing"
                            }`}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
              <DialogFooter className="px-8 pb-7 pt-6 sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={() => openSettings(false)}
                  className="font-semibold hover:bg-transparent"
                  style={{ color: RC_BLUE }}
                  data-testid="button-settings-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (isInteractions) {
                      setVisibleInteractionCols(draftCols);
                    } else {
                      setVisibleCols(draftCols);
                      setColOrder(draftOrder);
                    }
                    setSettingsOpen(false);
                  }}
                  className="font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: RC_BLUE }}
                  data-testid="button-settings-save"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </main>
  );
};
