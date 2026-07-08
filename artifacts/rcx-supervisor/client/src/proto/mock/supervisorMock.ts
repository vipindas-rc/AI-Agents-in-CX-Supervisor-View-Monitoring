import { SortType } from '@ringcx/ui';
import type {
  ISupervisorTableCol,
  ISupervisorAgentListItem,
} from '../eag/containers/SupervisorAgentList/types/SupervisorAgentList';
import captured from './captured-data.json';

// Real data shapes captured from the running RingCX app (SupervisorSvc), so the
// fields/icons/rollups match exactly what the components expect.
const clone = <T>(v: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));

// --- Agents tab columns (from SupervisorAgentList.story.tsx) ---
export const columns: ISupervisorTableCol[] = [
  { id: 'fullName', content: 'Agent', sortAs: SortType.STRING, visible: true, disabled: true, width: 180 },
  { id: 'agentState', content: 'State', sortAs: SortType.STRING, visible: true, width: 160 },
  { id: 'agentType', content: 'Agent type', sortAs: SortType.STRING, visible: true, width: 120 },
  { id: 'stateDuration', content: 'State duration', sortAs: SortType.NUMBER, visible: true, width: 120 },
  { id: 'pendingDispTime', content: 'Pending disposition', sortAs: SortType.NUMBER, visible: true, width: 120 },
  { id: 'activeInteractions', content: 'Active interactions', sortAs: SortType.STRING, visible: true, width: 140 },
  { id: 'longestActiveInteraction', content: 'Longest active interaction', sortAs: SortType.NUMBER, visible: true, width: 140 },
  { id: 'interactionsRollup', content: 'Interactions rollup', sortAs: SortType.NUMBER, visible: true, width: 120 },
  { id: 'talkTime', content: 'Talk time', sortAs: SortType.NUMBER, visible: true, width: 100 },
  { id: 'averageTimePerCall', content: 'Average time per call', sortAs: SortType.NUMBER, visible: true, width: 130 },
  { id: 'login', content: 'Login', sortAs: SortType.NUMBER, visible: true, width: 90 },
  { id: 'skill', content: 'Skill', sortAs: SortType.STRING, visible: true, width: 160 },
  { id: 'utilization', content: 'Utilization', sortAs: SortType.NUMBER, visible: true, width: 100 },
];

// --- Interactions tab columns (real ids; first col 'sourceName' is skipped by the
// row renderer and filled by the leading SourceTypeIcon). ---
export const interactionColumns: ISupervisorTableCol[] = [
  { id: 'sourceName', content: 'Channel', sortAs: SortType.STRING, visible: true, disabled: true, width: 180 },
  { id: 'categories', content: 'Categories', sortAs: SortType.STRING, visible: true, width: 280 },
  { id: 'productName', content: 'Product', sortAs: SortType.STRING, visible: true, width: 140 },
  { id: 'agentDurationMs', content: 'Interaction', sortAs: SortType.NUMBER, visible: true, width: 110 },
  { id: 'fullName', content: 'Agent', sortAs: SortType.STRING, visible: true, width: 160 },
  { id: 'agentType', content: 'Agent type', sortAs: SortType.STRING, visible: true, width: 120 },
  { id: 'confidenceScore', content: 'Confidence', sortAs: SortType.NUMBER, visible: true, width: 120 },
  { id: 'sentimentScore', content: 'Sentiment', sortAs: SortType.NUMBER, visible: true, width: 120 },
  { id: 'contactIdentity', content: 'From', sortAs: SortType.STRING, visible: true, width: 170 },
  { id: 'threadTitle', content: 'Subject', sortAs: SortType.STRING, visible: true, width: 200 },
  { id: 'pendingDispositionMs', content: 'Pending disp.', sortAs: SortType.NUMBER, visible: true, width: 110 },
];

// --- Interaction-rollup popover columns (real INTERACTION_ROLLUP_COLUMNS) ---
// translationPath is humanized by the i18n stub -> "Channel" / "Total".
export const rollupColumns: any[] = [
  { id: 'sourceType', translationPath: 'Channel', sortAs: SortType.STRING },
  { id: 'count', translationPath: 'Total', sortAs: SortType.NUMBER },
];

// Channels that map to real glyphs in TypeIcon.sourceTypeMap; sourceColor is a
// digitalColorMap INDEX ('0'-'9'), not a hex.
const CHANNELS = [
  { type: 'WEB_CHAT', name: 'Web Chat', color: '4' },
  { type: 'EMAIL', name: 'Support Inbox', color: '6' },
  { type: 'TWITTER', name: 'Twitter', color: '3' },
  { type: 'FACEBOOK', name: 'Facebook', color: '1' },
  { type: 'INSTAGRAM', name: 'Instagram', color: '7' },
  { type: 'WHATS_APP', name: 'WhatsApp', color: '2' },
  { type: 'SMS', name: 'SMS', color: '5' },
  { type: 'VOICE', name: 'Voice', color: '0' },
];

// Deterministic per-agent 24h rollup breakdown (3-5 channels with counts).
function makeRollup(seed: number) {
  const n = 3 + (seed % 3); // 3-5 channels
  const rows = Array.from({ length: n }, (_, k) => {
    const ch = CHANNELS[(seed + k) % CHANNELS.length];
    const count = 2 + ((seed * 7 + k * 13) % 28); // 2-29
    return {
      glId: `${ch.type}-${seed}`,
      sourceId: `${ch.type}-${seed}`,
      sourceType: ch.type,
      sourceName: ch.name,
      sourceColor: ch.color,
      count,
    };
  });
  const total = rows.reduce((s, r) => s + r.count, 0);
  return { rows, total };
}

// Varied agent states so the State filter has real options (captured data is all
// ENGAGED). state = label shown; base = drives the state-dot color.
// Human agents use the full human state set.
const HUMAN_STATES = [
  { state: 'Engaged', base: 'ENGAGED' },
  { state: 'Available', base: 'AVAILABLE' },
  { state: 'Wrap-up', base: 'WRAP_UP' },
  { state: 'Break', base: 'NOT_READY' },
  { state: 'Lunch', base: 'NOT_READY' },
];

// AirPro (AI) agents only ever carry one of these four states:
//  - Engaged / Available are automatic, same as humans.
//  - Inactive means the agent is turned off (only a supervisor can switch it
//    back on); it still shows in the list.
//  - Pending Inactive is the transitional drain-then-inactive state.
const AIR_STATES = [
  { state: 'Engaged', base: 'ENGAGED' },
  { state: 'Available', base: 'AVAILABLE' },
  { state: 'Inactive', base: 'INACTIVE' },
  { state: 'Pending Inactive', base: 'PENDING_INACTIVE' },
];

// Roles assigned to AirPro (AI) agents, cycled deterministically by index so the
// same agent shows the same role on both the Agents and Interactions tabs.
const AIRPRO_ROLES = [
  'Billing Agent',
  'Sales Agent',
  'Support Agent',
  'Retention Agent',
  'Technical Agent',
  'Onboarding Agent',
];

// Canonical AirPro display name for a given row index: a human-style name plus
// the agent's role, e.g. "Maria Brown (Billing Agent)". Both tabs derive the
// base name from the captured agents list (keyed by index) so the AI agent's
// identity stays aligned across the Agents and Interactions tabs.
function airProName(i: number): string {
  const list = captured.agents as any[];
  const base = list[i % list.length].fullName;
  const role = AIRPRO_ROLES[Math.floor(i / 3) % AIRPRO_ROLES.length];
  return `${base} (${role})`;
}

const VOICE_CHANNEL = CHANNELS.find((c) => c.type === 'VOICE')!;
const DIGITAL_CHANNELS = CHANNELS.filter((c) => c.type !== 'VOICE');

// Deterministic real-time quality signals. Confidence drives the two-tier row
// alerting (critical < 25 -> red row, warning 25–40 -> orange row), cycled per
// AI interaction across the ~8 AI rows. Sentiment on AI rows is paired to
// confidence by index (AI_SENTIMENT_POOL) so a low-confidence interaction also
// reads low on sentiment; human rows carry sentiment only (SENTIMENT_POOL).
//
// A few base values are deliberately parked ON a threshold boundary so the live
// ±5 drift carries them back and forth across it, making rows flip into and out
// of the flagged state on screen (the "real-time" supervision signal):
//   - confidence 40  -> oscillates 35–45, flips warning <-> healthy.
//   - confidence 26  -> oscillates 21–31, flips critical <-> warning.
//   - sentiment 40   -> oscillates 35–45, flips a human row warning <-> healthy.
// The remaining values sit with >=5 margin inside their band so they stay put,
// keeping the motion intentional and low-distraction rather than chaotic.
const SENTIMENT_POOL = [82, 64, 91, 73, 88, 70, 95, 78, 60, 85, 72, 90, 40, 80, 40];
const CONFIDENCE_POOL = [90, 16, 40, 74, 12, 26, 92, 33];
const AI_SENTIMENT_POOL = [84, 16, 70, 78, 14, 70, 90, 31];

const toInteraction = (c: { type: string; color: string; name: string }) => ({
  channelType: c.type,
  sourceColor: c.color,
  sourceName: c.name,
});

// Builds an agent's active-interaction list (one icon per concurrent interaction).
// Business rule: an agent can handle at MOST one voice call at a time, but several
// digital interactions can run in parallel. Two showcase agents demonstrate the
// multi-interaction case; everyone else has a single interaction.
function makeActiveInteractions(
  i: number,
  primary: { type: string; color: string; name: string },
) {
  // Scenario A: one voice + two parallel digital interactions.
  if (i === 0) {
    return [VOICE_CHANNEL, DIGITAL_CHANNELS[0], DIGITAL_CHANNELS[1]].map(
      toInteraction,
    );
  }
  // Scenario B: three parallel digital interactions, no voice.
  if (i === 6) {
    return [
      DIGITAL_CHANNELS[2],
      DIGITAL_CHANNELS[3],
      DIGITAL_CHANNELS[4],
    ].map(toInteraction);
  }
  // Default: a single interaction on the agent's primary channel.
  return [toInteraction(primary)];
}

// AirPro (AI) agents run several digital interactions in parallel. Each working
// AI agent carries two concurrent digital interactions, which reads as a busy
// virtual agent and yields enough AI interaction rows (confidence is AI-only) to
// surface the full alert spread: 2 critical + 3 warning across the AI rows.
function makeAirInteractions(i: number) {
  // Two engaged AirPro agents (rows 2 and 14 cycle onto the Engaged state)
  // carry a live voice-only call so the monitoring dialpad's AI flow can be
  // exercised — the Monitor icon is only offered on voice-only rows.
  if (i === 2 || i === 14) {
    return [VOICE_CHANNEL].map(toInteraction);
  }
  const a = DIGITAL_CHANNELS[i % DIGITAL_CHANNELS.length];
  const b = DIGITAL_CHANNELS[(i + 1) % DIGITAL_CHANNELS.length];
  return [a, b].map(toInteraction);
}

export function makeAgents(_count?: number): ISupervisorAgentListItem[] {
  return clone(captured.agents).map((a: any, i: number) => {
    const r = makeRollup(i + 1);
    // give each agent a varied primary channel so the Channel filter is meaningful
    const ch = CHANNELS[i % CHANNELS.length];
    // every 3rd agent is an AirPro (virtual) agent; the rest are Human.
    const isAir = i % 3 === 2;
    const agentType = isAir ? 'Air' : 'Human';

    // AirPro agents draw from the 4 AirPro states; humans from the human set.
    // Cycling the per-type index keeps every state represented in the table.
    const st = isAir
      ? AIR_STATES[Math.floor(i / 3) % AIR_STATES.length]
      : HUMAN_STATES[i % HUMAN_STATES.length];

    // status mirrors the AirPro on/off state and drives the Air-only
    // Active/Inactive filter. Pending Inactive is still draining work, so it
    // stays Active until the drain completes; only Inactive is off.
    const status = isAir
      ? st.state === 'Inactive'
        ? 'Inactive'
        : 'Active'
      : '';
    // Only AirPro agents that are engaged or still draining carry in-flight
    // interactions; idle/off AI agents have none. Humans always show their work.
    const airHasWork = st.base === 'ENGAGED' || st.base === 'PENDING_INACTIVE';
    const interactions = isAir
      ? airHasWork
        ? makeAirInteractions(i)
        : []
      : makeActiveInteractions(i, ch);

    // AirPro (AI) agents use a human-style name plus their role, e.g.
    // "Maria Brown (Billing Agent)", and the same name appears on the
    // Interactions tab so the AI agent identity stays aligned across both tabs.
    const fullName = isAir ? airProName(i) : a.fullName;
    return {
      ...a,
      fullName,
      agentType,
      status,
      agentState: st.state,
      agentStateLabel: st.state,
      agentBaseState: st.base,
      originalAgentBaseState: st.base,
      activeInteractions: interactions,
      activeInteractionsSearchCols: interactions,
      // per-channel breakdown for the rollup popover + the clickable total
      rollupBreakdown: r.rows,
      interactionsRollup: r.total,
      interactions24hRollupTotalCount: r.total,
    };
  }) as unknown as ISupervisorAgentListItem[];
}

// --- AI Insights side panel (mock content) ------------------------------------
// The supervisor opens the AI Insights panel from an interaction row. The panel
// has three tabs — Notes, Transcript, Checklist — plus a metrics summary and a
// live (mock-streamed) transcript. Content below is shared by all three tabs and
// kept coherent: the Notes summary, the streamed transcript and the checklist all
// describe the same Sam Carter / one-color-shirts negotiation.

// Metric summary shown above the tabs. dot drives the colored status dot.
export interface InsightMetric {
  label: string;
  value: string;
  dot: 'positive' | 'warning' | 'negative';
}

export const INSIGHT_METRICS: InsightMetric[] = [
  { label: 'Sentiment', value: 'Positive', dot: 'positive' },
  { label: 'Speech Pace', value: '135 WPM', dot: 'positive' },
  { label: 'Talk Ratio', value: '49%', dot: 'negative' },
];

// Notes tab — AI-generated call summary, grouped into headed sections.
export interface InsightNoteSection {
  heading: string;
  bullets: string[];
}

export const INSIGHT_NOTES: InsightNoteSection[] = [
  {
    heading: 'Reason for contact',
    bullets: [
      'Sam found a cheaper one-color shirt from Great Polos Inc. bringing the order price to $4.8K.',
    ],
  },
  {
    heading: 'Actions taken by agent',
    bullets: [
      'Switch to one-color shirts from Great Polos Inc. to meet Sam’s price.',
    ],
  },
  {
    heading: 'Next steps',
    bullets: [
      'Anita to send a revised quote to Sam in a couple of hours. Anita needs manager approval to update the quote.',
    ],
  },
];

export const INSIGHT_NOTES_UPDATED_AT = '09:38 AM';

// Checklist tab — guided-selling / compliance steps the agent should cover.
export interface InsightChecklistItem {
  label: string;
  done: boolean;
}

export const INSIGHT_CHECKLIST: InsightChecklistItem[] = [
  { label: 'Greet the customer and confirm their identity', done: true },
  { label: 'Understand the reason for contact', done: true },
  { label: 'Confirm order details and budget', done: true },
  { label: 'Offer a tailored solution or alternative', done: true },
  { label: 'Get manager approval for pricing changes', done: false },
  { label: 'Send the revised quote and confirm next steps', done: false },
  { label: 'Recap the conversation before closing', done: false },
];

// Live transcript — replayed turn-by-turn to simulate a live conversation. type
// mirrors the real chat Message contract ('SYSTEM' | 'CLIENT' | 'AGENT'); CLIENT
// is the customer (Sam), AGENT is the handling agent (named per the row).
export interface TranscriptTurn {
  type: 'SYSTEM' | 'CLIENT' | 'AGENT';
  name?: string;
  message: string;
}

const CUSTOMER_NAME = 'Sam Carter';

const TRANSCRIPT_TURNS: TranscriptTurn[] = [
  { type: 'CLIENT', message: "Hi, I got your quote but honestly it's over our budget for the team shirts." },
  { type: 'AGENT', message: 'Hi Sam, thanks for letting me know. What price point are you aiming for?' },
  { type: 'CLIENT', message: 'I found one-color shirts from Great Polos Inc. at around $4.8K for the whole order.' },
  { type: 'AGENT', message: 'Got it. Our quote is for multi-color printing, which adds cost. Switching to a one-color design would get us much closer to that.' },
  { type: 'CLIENT', message: 'That could work. We mainly care about the logo looking clean.' },
  { type: 'AGENT', message: 'Perfect — a single-color logo will look sharp and keeps the price down. Let me put together a revised quote.' },
  { type: 'CLIENT', message: 'Great. How soon can you send it over?' },
  { type: 'AGENT', message: 'I should have it to you in a couple of hours. I just need a quick manager approval to update the pricing.' },
  { type: 'CLIENT', message: 'Sounds good, thank you Anita.' },
  { type: 'AGENT', message: "My pleasure, Sam. I'll follow up shortly with the new quote." },
];

// Negative / escalating variant used for low-confidence interactions: the
// customer grows increasingly frustrated while the agent hedges and struggles
// (uncertain answers) — so the conversation reads as steadily declining
// sentiment with low confidence, matching the row's quality signals.
const NEGATIVE_TRANSCRIPT_TURNS: TranscriptTurn[] = [
  { type: 'CLIENT', message: "This is the third time I'm reaching out about my refund and it's still not sorted." },
  { type: 'AGENT', message: "I'm sorry to hear that. Let me try to pull up your account... give me a moment." },
  { type: 'CLIENT', message: "I've already waited over a week. Why is this taking so long?" },
  { type: 'AGENT', message: "I'm honestly not sure why it didn't process — it might be a system issue on our end." },
  { type: 'CLIENT', message: "That's not good enough. I was promised this would be resolved last time too." },
  { type: 'AGENT', message: "You're right, and I apologize. I may need to escalate this, but I'm not certain who handles it." },
  { type: 'CLIENT', message: "Seriously? You don't even know who can help me with this?" },
  { type: 'AGENT', message: "Let me check... I think it's the billing team, though I'll have to confirm that." },
  { type: 'CLIENT', message: "This is really frustrating. I'm close to just cancelling my account." },
  { type: 'AGENT', message: "Please don't — I'll do my best to fix it. Could you give me a little more time?" },
  { type: 'CLIENT', message: "I've given you plenty of time already. This is completely unacceptable." },
  { type: 'AGENT', message: "I understand your frustration. I'm escalating this now, but I can't promise a timeline." },
];

// Returns the transcript turns for the monitored interaction. The opening
// SYSTEM line reads "Agent connected" (chat) or "Call connected" (voice), and
// each speaker turn is labelled with the customer / handling-agent name.
export function makeTranscript(opts: {
  isVoice: boolean;
  agentName: string;
}): TranscriptTurn[] {
  const connected: TranscriptTurn = {
    type: 'SYSTEM',
    message: opts.isVoice ? 'Call connected' : 'Agent connected',
  };
  const turns = TRANSCRIPT_TURNS.map((turn) => ({
    ...turn,
    name: turn.type === 'CLIENT' ? CUSTOMER_NAME : opts.agentName,
  }));
  return [connected, ...turns];
}

// Number of conversation turns that loop after the opening SYSTEM line.
export const TRANSCRIPT_CONVERSATION_LENGTH = TRANSCRIPT_TURNS.length;

// Resolves the transcript turn at an absolute (ever-growing) stream index so the
// panel can keep a conversation "live" indefinitely: index 0 is the connected
// SYSTEM line, every later index cycles through the same coherent conversation.
export function transcriptTurnAt(
  absIndex: number,
  opts: { isVoice: boolean; agentName: string; tone?: 'positive' | 'negative' }
): TranscriptTurn {
  if (absIndex <= 0) {
    return {
      type: 'SYSTEM',
      message: opts.isVoice ? 'Call connected' : 'Agent connected',
    };
  }
  const script =
    opts.tone === 'negative' ? NEGATIVE_TRANSCRIPT_TURNS : TRANSCRIPT_TURNS;
  const turn = script[(absIndex - 1) % script.length];
  return {
    ...turn,
    name: turn.type === 'CLIENT' ? CUSTOMER_NAME : opts.agentName,
  };
}

// The Interactions tab is derived directly from the Agents tab: for every agent
// we emit one interaction row per entry in their "Active interactions" list, so
// clicking an agent's active-interaction icons on the Agents tab always lands on
// real, matching rows in the Interactions tab (which then blink to show the
// selection). Rich fields (contact, subject, categories, durations) are cycled
// from the captured interaction templates so the table still looks realistic.
export function makeInteractions(_agents?: unknown): any[] {
  const templates = clone(captured.interactions) as any[];
  const agents = makeAgents() as any[];
  const rows: any[] = [];
  let t = 0;
  let aiIdx = 0;

  agents.forEach((agent: any) => {
    const active: any[] = agent.activeInteractions ?? [];
    active.forEach((ai: any, k: number) => {
      const tmpl = templates[t % templates.length];
      t += 1;

      const ch =
        CHANNELS.find((c) => c.type === ai.channelType) ?? CHANNELS[0];
      const isVoice = ch.type === 'VOICE';
      const isAir = agent.agentType === 'Air';
      const engagementId = `eng-${agent.agentId}-${k + 1}`;
      // category ids referencing injector CATEGORIES_MAP (1-6); some rows blank
      const cats =
        t % 4 === 0
          ? ''
          : [String((t % 6) + 1), String(((t + 2) % 6) + 1)].join(',');

      const base: any = {
        ...tmpl,
        engagementId,
        glId: engagementId,
        agentId: agent.agentId,
        categoryIds: cats,
        // Agent column shows the handling agent's name; for AI agents this is the
        // AirPro identity ("Name (Role)"), matching the Agents tab.
        fullName: agent.fullName,
        agentName: agent.fullName,
        agentType: agent.agentType,
        sourceType: ch.type,
        sourceName: ch.name,
        sourceColor: ch.color,
        engagementSource: {
          ...(tmpl.engagementSource || {}),
          initialEngagementSourceType: ch.type,
          initialEngagementSourceName: ch.name,
          initialEngagementSourceColor: ch.color,
        },
        isVoiceInteraction: isVoice,
        // Voice AI Insights is gated on the call being recorded across all agent
        // legs (RingCX rule). Without this, the AI Insights icon is hidden for
        // voice rows; digital rows fall through to the feature-flag path.
        perspectiveRecordingMode: isVoice ? 'ALL_AGENT_LEGS' : undefined,
        pendingDispositionMs: tmpl.pendingDispositionMs ?? 0,
        // All true at rest = "not currently being monitored" -> no blue row.
        // (isCurrentlyMonitoring = !showMonitor || !showCoach || !showBargeIn.)
        // The Monitor/Coach icons are still type-gated to VOICE rows by the renderer.
        showViewInsights: true,
        showBargeIn: true,
        showMonitor: true,
        showCoach: true,
      };

      if (isAir) {
        // AirPro (AI) interactions: Product is the executing "Workflow" and the
        // AI interaction has no pending disposition -> renders em-dash.
        base.productName = 'Workflow';
        base.pendingDispositionMs = 0;
      }

      // Real-time quality signals (mock-simulated). Sentiment is present for both
      // AI and human interactions; confidence is AI-only (null for humans, where
      // the cell renders an em-dash).
      if (isAir) {
        const ci = aiIdx++ % CONFIDENCE_POOL.length;
        base.confidenceScore = CONFIDENCE_POOL[ci];
        // Sentiment tracks confidence on AI rows (same index): when confidence
        // dips, sentiment dips too, so a struggling AI interaction reads low on
        // both signals.
        base.sentimentScore = AI_SENTIMENT_POOL[ci];
      } else {
        base.confidenceScore = null;
        base.sentimentScore = SENTIMENT_POOL[(t - 1) % SENTIMENT_POOL.length];
      }

      rows.push(base);
    });
  });

  return rows;
}
