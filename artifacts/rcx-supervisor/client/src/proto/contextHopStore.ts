import { useSyncExternalStore } from "react";

import type { ContextHopEvent } from "./InteractionPreview";

// ---------------------------------------------------------------------------
// Module-level store for runtime hop-log events (take over / transfer) and the
// active-call registration made when a voice take-over commits. Lives outside
// React state so the Active calls screen (mounted by the page, outside the
// AgentTablePanel tree) sees the same hop history as the monitoring window
// and the interaction preview.
// ---------------------------------------------------------------------------

const hopsByEngagement = new Map<string, ContextHopEvent[]>();
const listeners = new Set<() => void>();
const EMPTY_HOPS: ContextHopEvent[] = [];

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function appendContextHop(
  engagementId: string,
  event: Omit<ContextHopEvent, "atMs">,
) {
  const existing = hopsByEngagement.get(engagementId) ?? [];
  // "You" is appended at most once per engagement (take over is one-way in
  // this prototype).
  if (event.kind === "you" && existing.some((e) => e.kind === "you")) return;
  hopsByEngagement.set(engagementId, [
    ...existing,
    { ...event, atMs: Date.now() },
  ]);
  emit();
}

export function useContextHops(engagementId: string | null): ContextHopEvent[] {
  return useSyncExternalStore(subscribe, () =>
    engagementId ? hopsByEngagement.get(engagementId) ?? EMPTY_HOPS : EMPTY_HOPS,
  );
}

// Identity of the voice engagement a supervisor has taken over, keyed by the
// agent it was taken from. Registered when the take-over commits so the
// Active calls screen can rebuild the same interaction data (and hop log)
// the monitoring window was showing.
export interface ActiveCallContext {
  engagementId: string;
  fullName: string;
  agentType?: string;
}

const activeCallByAgent = new Map<string, ActiveCallContext>();

export function registerActiveCallContext(
  agentId: string,
  ctx: ActiveCallContext,
) {
  activeCallByAgent.set(agentId, ctx);
  emit();
}

export function useActiveCallContext(
  agentId: string | null,
): ActiveCallContext | null {
  return useSyncExternalStore(subscribe, () =>
    agentId ? activeCallByAgent.get(agentId) ?? null : null,
  );
}
