import { useEffect, useMemo, useRef, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ActionButton, Dialer, buildAssets, type Assets } from "./Dialer";
import {
  transcriptTurnAt,
  type TranscriptTurn,
} from "../mock/supervisorMock";

/**
 * Monitoring call window (Figma: mLIWieGGOG574eVKpKA50f, node 49:21797).
 *
 * A macOS-style "RingCX phone call" window (800x534) combining the monitoring
 * dialer (left, 280px) with a live Notes & Transcript panel (right, 520px).
 * Replaces the old MonitoringDialpad popup for voice monitoring.
 *
 * States (carried over from MonitoringDialpad):
 * - AI (Air) agent listening   -> Coach/Barge unavailable, Take over enabled
 * - Human agent listen-only    -> Mute disabled + tooltip, Coach/Barge/Take over
 * - Human agent barged         -> Mute toggles, Barge active, snackbar
 * - Taken over                 -> swaps to the existing active-call dialpad (Dialer)
 *
 * Non-modal (no backdrop) so the agent table stays clickable and the existing
 * monitor toggle semantics keep working.
 */

export type MonitoringCallWindowProps = {
  agentName: string;
  agentType: "Air" | "Human";
  /** Customer side of the monitored call (design shows a phone number). */
  customerPhone?: string;
  avatarBg?: string;
  /** Called whenever the window should close (end call, close control). */
  onClose: () => void;
  /** Host flash-toast hook for secondary feedback. */
  onToast?: (message: string) => void;
  assetBasePath?: string;
};

type Phase = "listening" | "barged" | "takenOver";
type PanelTab = "contact" | "notes";

const DEFAULT_CUSTOMER_PHONE = "(360) 765-2456";
const MONITORING_TOOLTIP = "Unavailable when monitoring";
// Coach (whisper) and Barge exist to support a human agent mid-call — they
// don't apply when an AI agent is handling the conversation (use Take over).
const AI_AGENT_TOOLTIP = "Not available for AI agents";
const WINDOW_W = 800;
const WINDOW_H = 534;
const LEFT_W = 280;

type MonitorAssets = Assets & {
  coach: string;
  barge: string;
  takeOver: string;
  popOut: string;
  collapse: string;
  contactUser: string;
  smartNotes: string;
  smartNotesActive: string;
  moreHoriz: string;
  aiSpinner: string;
  globe: string;
  notesPause: string;
  searchGray: string;
};

const MONITOR_ICON_VERSION = "?v=2";

function buildMonitorAssets(base: string): MonitorAssets {
  const p = base.replace(/\/$/, "");
  const v = MONITOR_ICON_VERSION;
  return {
    ...buildAssets(base),
    coach: `${p}/icon-coach-v2.svg`,
    barge: `${p}/icon-barge-v2.svg`,
    takeOver: `${p}/icon-take-over-v2.svg`,
    popOut: `${p}/icon-pop-out.svg${v}`,
    collapse: `${p}/icon-collapse-window.svg${v}`,
    contactUser: `${p}/icon-contact-user.svg${v}`,
    smartNotes: `${p}/icon-smart-notes.svg${v}`,
    smartNotesActive: `${p}/icon-smart-notes-active.svg${v}`,
    moreHoriz: `${p}/icon-more-horiz.svg`,
    aiSpinner: `${p}/icon-ai-spinner.svg${v}`,
    globe: `${p}/icon-globe.svg`,
    notesPause: `${p}/icon-notes-pause.svg${v}`,
    searchGray: `${p}/icon-search-gray.svg`,
  };
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatClock(d: Date): string {
  let h = d.getHours();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${d.getMinutes().toString().padStart(2, "0")} ${suffix}`;
}

/* -------------------- DRAG SUPPORT -------------------- */

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
    // Don't hijack clicks on the titlebar's window controls.
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

/* -------------------- LIVE TRANSCRIPT FEED -------------------- */

type FeedEntry = TranscriptTurn & { at: string; key: number };

/**
 * Streams the shared mock transcript in as the call progresses: seeds a few
 * opening turns immediately, then appends a new turn every few seconds via
 * transcriptTurnAt (same feed mechanism the AI Insights panel uses).
 */
function useTranscriptFeed(agentName: string): FeedEntry[] {
  const [entries, setEntries] = useState<FeedEntry[]>(() => {
    const now = new Date();
    return [0, 1, 2, 3].map((i) => ({
      ...transcriptTurnAt(i, { isVoice: true, agentName }),
      at: formatClock(now),
      key: i,
    }));
  });
  const nextIndex = useRef(4);

  useEffect(() => {
    const id = window.setInterval(() => {
      const i = nextIndex.current;
      nextIndex.current += 1;
      setEntries((prev) => [
        ...prev,
        {
          ...transcriptTurnAt(i, { isVoice: true, agentName }),
          at: formatClock(new Date()),
          key: i,
        },
      ]);
    }, 4000);
    return () => window.clearInterval(id);
  }, [agentName]);

  return entries;
}

/* -------------------- SMALL PIECES -------------------- */

function WindowTitleBar({
  assets,
  onClose,
  onDragPointerDown,
}: {
  assets: MonitorAssets;
  onClose: () => void;
  onDragPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className="h-[28px] relative shrink-0 w-full bg-white border-b border-[#0000001a] cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={onDragPointerDown}
      data-testid="monitor-drag-handle"
    >
      <div className="absolute left-[8px] top-1/2 -translate-y-1/2 flex gap-[8px]">
        <button
          type="button"
          onClick={onClose}
          data-testid="button-monitor-close"
          className="size-[12px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 active:scale-90 transition-all"
          aria-label="Close"
        >
          <img alt="" className="size-[12px] block" src={assets.controlRed} />
        </button>
        <button
          type="button"
          data-testid="button-monitor-minimize"
          className="size-[12px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 active:scale-90 transition-all"
          aria-label="Minimize"
        >
          <img alt="" className="size-[12px] block" src={assets.controlYellow} />
        </button>
        <button
          type="button"
          data-testid="button-monitor-maximize"
          className="size-[12px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 active:scale-90 transition-all"
          aria-label="Maximize"
        >
          <img alt="" className="size-[12px] block" src={assets.controlGreen} />
        </button>
      </div>
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Lato',sans-serif] font-bold text-[13px] text-[#121212] whitespace-nowrap select-none">
        RingCX phone call
      </p>
    </div>
  );
}

function MonitorHeaderRow({
  timer,
  assets,
  panelCollapsed,
  onTogglePanel,
}: {
  timer: string;
  assets: MonitorAssets;
  panelCollapsed: boolean;
  onTogglePanel: () => void;
}) {
  return (
    <div className="flex h-[36px] items-center justify-between w-full">
      <div className="flex gap-[4px] items-center">
        <time
          data-testid="text-monitor-timer"
          className="font-['Lato',sans-serif] font-bold leading-[20px] text-[14px] text-[#121212] whitespace-nowrap tabular-nums"
        >
          {timer}
        </time>
        <div className="flex gap-[4px] items-center">
          <img alt="Good connection" className="size-[16px]" src={assets.goodConnection} />
          <img alt="HD" className="size-[16px]" src={assets.hd} />
          <img alt="RingCentral Bridge off" className="size-[16px]" src={assets.rbnOff} />
        </div>
      </div>
      <div className="flex gap-[8px] items-center">
        <button
          type="button"
          data-testid="button-monitor-pop-out"
          className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70 active:scale-90 transition-all"
          aria-label="Pop out window"
        >
          <img alt="" className="size-[16px] block" src={assets.popOut} />
        </button>
        <button
          type="button"
          data-testid="button-monitor-collapse"
          onClick={onTogglePanel}
          className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70 active:scale-90 transition-all"
          aria-label={panelCollapsed ? "Show side panel" : "Hide side panel"}
        >
          <img
            alt=""
            className={`size-[16px] block transition-transform ${panelCollapsed ? "rotate-180" : ""}`}
            src={assets.collapse}
          />
        </button>
      </div>
    </div>
  );
}

function MonitorProfile({
  agentName,
  customerPhone,
  avatarBg,
}: {
  agentName: string;
  customerPhone: string;
  avatarBg: string;
}) {
  return (
    <div className="flex gap-[12px] items-start pb-[12px] pt-[10px] w-full">
      <div
        className="flex items-center justify-center rounded-full size-[40px] shrink-0"
        style={{ backgroundColor: avatarBg }}
      >
        <p className="font-['Lato',sans-serif] font-bold leading-[24px] text-[16px] text-white">
          {initialsOf(agentName)}
        </p>
      </div>
      <div className="flex flex-col items-start min-w-0">
        <p
          data-testid="text-monitoring-title"
          className="font-['Lato',sans-serif] font-bold leading-[24px] text-[16px] text-[#121212]"
        >
          Monitoring call
        </p>
        <p
          data-testid="text-monitoring-parties"
          className="font-['Lato',sans-serif] leading-[16px] text-[12px] text-[#121212]"
        >
          {agentName} and {customerPhone}
        </p>
      </div>
    </div>
  );
}

/** Hover tooltip used on controls that are unavailable while monitoring. */
function UnavailableTooltip({
  children,
  label = MONITORING_TOOLTIP,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>
        <div className="inline-flex" data-testid="tooltip-unavailable-trigger">{children}</div>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          sideOffset={4}
          className="z-[10001] bg-[#666666] text-white font-['Lato',sans-serif] text-[12px] leading-[16px] px-[8px] py-[4px] rounded-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.25)] select-none"
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-[#666666]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

function BargeSnackbar({ agentName, customerPhone }: { agentName: string; customerPhone: string }) {
  return (
    <div
      data-testid="snackbar-barge"
      className="absolute left-[140px] -translate-x-1/2 top-[40px] z-20 bg-[#666666] rounded-[4px] px-[16px] py-[12px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]"
    >
      <p className="font-['Lato',sans-serif] leading-[20px] text-[14px] text-white text-center whitespace-nowrap m-0">
        {agentName} and {customerPhone}
      </p>
      <p className="font-['Lato',sans-serif] leading-[20px] text-[14px] text-white text-center whitespace-nowrap m-0">
        can both hear you
      </p>
    </div>
  );
}

/* -------------------- RIGHT PANEL PIECES -------------------- */

function PanelTabBar({
  assets,
  activeTab,
  onTabChange,
}: {
  assets: MonitorAssets;
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}) {
  const tabClass = (active: boolean) =>
    `relative flex h-[44px] items-center gap-[6px] px-[12px] border-none bg-transparent cursor-pointer font-['Lato',sans-serif] text-[14px] leading-[20px] whitespace-nowrap select-none transition-colors ${
      active ? "font-bold text-[#066FAC]" : "text-[#666666] hover:text-[#121212]"
    }`;
  const underline = (
    <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#066FAC] rounded-t-[2px]" />
  );
  return (
    <div className="flex items-center h-[44px] w-full border-b border-[#e0e0e0] px-[8px] shrink-0">
      <button
        type="button"
        className={tabClass(activeTab === "contact")}
        onClick={() => onTabChange("contact")}
        data-testid="tab-monitor-contact"
      >
        <img alt="" className="size-[20px] block" src={assets.contactUser} />
        Contact info
        {activeTab === "contact" && underline}
      </button>
      <button
        type="button"
        className={tabClass(activeTab === "notes")}
        onClick={() => onTabChange("notes")}
        data-testid="tab-monitor-notes"
      >
        <img
          alt=""
          className="size-[20px] block"
          src={activeTab === "notes" ? assets.smartNotesActive : assets.smartNotes}
        />
        Notes and transcripts
        {activeTab === "notes" && underline}
      </button>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5L9.7 6.3L14.5 8L9.7 9.7L8 14.5L6.3 9.7L1.5 8L6.3 6.3L8 1.5Z"
        stroke="#121212"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type NotesPreviewState = "loading" | "ready";

function NotesPreviewSheet({
  state,
  lastUpdated,
  onUpdate,
  onClose,
}: {
  state: NotesPreviewState;
  lastUpdated: string;
  onUpdate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20" data-testid="notes-preview-overlay">
      {/* Scrim over the panel behind the sheet */}
      <div className="absolute inset-0 bg-black/50" />
      {/* White notes sheet */}
      <div className="absolute left-0 right-0 bottom-0 top-[36px] bg-white rounded-t-[8px] flex flex-col">
        <div className="flex items-start justify-between px-[16px] pt-[14px] pb-[10px] shrink-0">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-[6px]">
              <SparkleIcon />
              <h3 className="font-['Lato',sans-serif] font-bold text-[15px] leading-[20px] text-[#121212] m-0">
                Notes
              </h3>
            </div>
            {state === "loading" ? (
              <p
                data-testid="text-notes-preparing"
                className="font-['Lato',sans-serif] text-[13px] leading-[18px] text-[#666666] m-0"
              >
                Preparing notes...
              </p>
            ) : (
              <div className="flex items-center gap-[8px]">
                <p className="font-['Lato',sans-serif] text-[13px] leading-[18px] text-[#666666] m-0">
                  Last updated at {lastUpdated}
                </p>
                <span className="w-px h-[14px] bg-[#e0e0e0]" />
                <button
                  type="button"
                  onClick={onUpdate}
                  data-testid="button-notes-update"
                  className="flex items-center gap-[4px] border-none bg-transparent p-0 cursor-pointer font-['Lato',sans-serif] text-[13px] leading-[18px] text-[#066FAC] hover:underline"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3"
                      stroke="#066FAC"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Update
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="button-notes-close"
            aria-label="Close notes"
            className="size-[20px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70 text-[#121212]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="#121212" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 px-[16px] pb-[16px]">
          <div className="h-full rounded-[8px] border border-[#e0e0e0] overflow-y-auto [scrollbar-width:thin] p-[16px]">
            {state === "loading" ? (
              <div className="flex flex-col gap-[10px]" data-testid="notes-skeleton">
                <div className="h-[10px] w-[92%] rounded-full bg-[#fbe3d3] animate-pulse" />
                <div className="h-[10px] w-[88%] rounded-full bg-[#fbe3d3] animate-pulse [animation-delay:150ms]" />
                <div className="h-[10px] w-[64%] rounded-full bg-[#fbe3d3] animate-pulse [animation-delay:300ms]" />
              </div>
            ) : (
              <div className="flex flex-col gap-[12px]" data-testid="notes-content">
                <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212] m-0">
                  Sam is ordering one-color team shirts and needs pricing that fits his budget.
                </p>
                <div>
                  <h4 className="font-['Lato',sans-serif] font-bold text-[13px] leading-[18px] text-[#121212] m-0 mb-[6px]">
                    Recap
                  </h4>
                  <ul className="m-0 pl-[18px] list-disc space-y-[6px]">
                    {[
                      "Received a quote for team shirts, but it's over budget.",
                      "Found one-color shirts from Great Polos Inc. at around $4.8K for the whole order.",
                      "Needs the most up-to-date pricing sheet to compare options.",
                    ].map((line) => (
                      <li
                        key={line}
                        className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212]"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-['Lato',sans-serif] font-bold text-[13px] leading-[18px] text-[#121212] m-0 mb-[6px]">
                    Tasks
                  </h4>
                  <ul className="m-0 pl-[18px] list-disc space-y-[6px]">
                    {[
                      "Send the latest pricing sheet.",
                      "Follow up on the one-color shirt option and final order size.",
                    ].map((line) => (
                      <li
                        key={line}
                        className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212]"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiTranscribingBanner({
  assets,
  paused,
  onTogglePause,
  onPreviewNotes,
}: {
  assets: MonitorAssets;
  paused: boolean;
  onTogglePause: () => void;
  onPreviewNotes: () => void;
}) {
  return (
    <div className="flex items-center gap-[8px] w-full rounded-[8px] bg-[#fdf0dd] px-[12px] py-[10px]">
      <span
        data-testid="loader-ai-transcribing"
        aria-hidden="true"
        className={`size-[18px] shrink-0 rounded-full border-2 border-[#e8890c]/25 border-t-[#e8890c] ${paused ? "" : "animate-spin [animation-duration:0.9s]"}`}
      />
      <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212] m-0">
        {paused ? "Transcription paused" : "AI is transcribing..."}
      </p>
      <button
        type="button"
        onClick={onPreviewNotes}
        data-testid="button-preview-notes"
        className="border-none bg-transparent p-0 cursor-pointer font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#066FAC] hover:underline"
      >
        Preview notes
      </button>
      <div className="ml-auto flex items-center gap-[10px]">
        <button
          type="button"
          data-testid="button-transcript-language"
          className="size-[18px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70"
          aria-label="Transcription language"
        >
          <img alt="" className="size-[18px] block" src={assets.globe} />
        </button>
        <button
          type="button"
          onClick={onTogglePause}
          data-testid="button-transcript-pause"
          className="size-[18px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70"
          aria-label={paused ? "Resume transcription" : "Pause transcription"}
        >
          <img alt="" className="size-[18px] block" src={assets.notesPause} />
        </button>
      </div>
    </div>
  );
}

function TranscriptSearchField({
  assets,
  value,
  onChange,
}: {
  assets: MonitorAssets;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-[8px] w-full h-[32px] rounded-[16px] bg-[#f3f3f3] px-[12px]">
      <img alt="" className="size-[16px] block shrink-0" src={assets.searchGray} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
        data-testid="input-transcript-search"
        className="flex-1 min-w-0 border-none bg-transparent outline-none font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212] placeholder:text-[#666666]"
      />
    </div>
  );
}

function TranscriptItem({
  entry,
  agentName,
  avatarBg,
}: {
  entry: FeedEntry;
  agentName: string;
  avatarBg: string;
}) {
  if (entry.type === "SYSTEM") {
    return (
      <div className="flex justify-center py-[6px]">
        <p className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] m-0">
          {entry.message}
        </p>
      </div>
    );
  }
  const name = entry.name ?? (entry.type === "AGENT" ? agentName : "Customer");
  const bg = entry.type === "AGENT" ? avatarBg : "#8a6fb8";
  return (
    <div className="flex gap-[10px] items-start py-[8px]" data-testid={`transcript-item-${entry.key}`}>
      <div
        className="flex items-center justify-center rounded-full size-[32px] shrink-0"
        style={{ backgroundColor: bg }}
      >
        <p className="font-['Lato',sans-serif] font-bold text-[12px] leading-[16px] text-white m-0">
          {initialsOf(name)}
        </p>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-[8px]">
          <p className="font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#121212] m-0 truncate">
            {name}
          </p>
          <p className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] m-0 shrink-0">
            {entry.at}
          </p>
        </div>
        <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#424242] m-0">
          {entry.message}
        </p>
      </div>
    </div>
  );
}

function NotesTranscriptPanel({
  assets,
  agentName,
  avatarBg,
  onPreviewNotes,
}: {
  assets: MonitorAssets;
  agentName: string;
  avatarBg: string;
  onPreviewNotes: () => void;
}) {
  const feed = useTranscriptFeed(agentName);
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
  const [generateAll, setGenerateAll] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return feed;
    return feed.filter(
      (e) =>
        e.message.toLowerCase().includes(q) ||
        (e.name ?? "").toLowerCase().includes(q),
    );
  }, [feed, search]);

  // Keep the live feed pinned to the newest turn (unless searching).
  useEffect(() => {
    if (search) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed.length, search]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full px-[16px] pt-[12px] pb-[12px] gap-[10px]">
      <div className="flex items-center justify-between w-full shrink-0">
        <h2 className="font-['Lato',sans-serif] font-bold text-[16px] leading-[24px] text-[#121212] m-0">
          Notes and transcript
        </h2>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            data-testid="button-notes-pop-out"
            className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70"
            aria-label="Open notes in a new window"
          >
            <img alt="" className="size-[16px] block" src={assets.popOut} />
          </button>
          <button
            type="button"
            data-testid="button-notes-more"
            className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70"
            aria-label="More options"
          >
            <img alt="" className="size-[16px] block" src={assets.moreHoriz} />
          </button>
        </div>
      </div>

      <AiTranscribingBanner
        assets={assets}
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        onPreviewNotes={onPreviewNotes}
      />

      <TranscriptSearchField assets={assets} value={search} onChange={setSearch} />

      <div
        ref={listRef}
        data-testid="transcript-list"
        className="flex-1 min-h-0 overflow-y-auto pr-[6px] [scrollbar-width:thin]"
      >
        {visible.map((entry) => (
          <TranscriptItem
            key={entry.key}
            entry={entry}
            agentName={agentName}
            avatarBg={avatarBg}
          />
        ))}
        {visible.length === 0 && (
          <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#666666] text-center pt-[24px]">
            No matching transcript lines
          </p>
        )}
      </div>

      <div className="flex items-center justify-between w-full shrink-0 rounded-[8px] border border-[#e0e0e0] px-[12px] py-[8px]">
        <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212] m-0">
          Generate notes for all calls
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={generateAll}
          onClick={() => setGenerateAll((v) => !v)}
          data-testid="switch-generate-notes"
          aria-label="Generate notes for all calls"
          className={`relative w-[36px] h-[20px] rounded-full border-none cursor-pointer transition-colors p-0 ${
            generateAll ? "bg-[#066FAC]" : "bg-[#bdbdbd]"
          }`}
        >
          <span
            className={`absolute top-[2px] size-[16px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all ${
              generateAll ? "left-[18px]" : "left-[2px]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function ContactInfoPanel({ customerPhone }: { customerPhone: string }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full px-[16px] pt-[12px] gap-[12px]">
      <h2 className="font-['Lato',sans-serif] font-bold text-[16px] leading-[24px] text-[#121212] m-0">
        Contact info
      </h2>
      <div className="flex flex-col gap-[8px]">
        <div>
          <p className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] m-0">
            Phone
          </p>
          <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212] m-0">
            {customerPhone}
          </p>
        </div>
        <div>
          <p className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] m-0">
            Name
          </p>
          <p className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212] m-0">
            Sam Carter
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------- MAIN COMPONENT -------------------- */

export function MonitoringCallWindow({
  agentName,
  agentType,
  customerPhone = DEFAULT_CUSTOMER_PHONE,
  avatarBg = "#509ac4",
  onClose,
  onToast,
  assetBasePath = "/figmaAssets",
}: MonitoringCallWindowProps) {
  const assets = buildMonitorAssets(assetBasePath);
  const [phase, setPhase] = useState<Phase>("listening");
  const [seconds, setSeconds] = useState(11);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [supervisorMuted, setSupervisorMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("notes");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [notesPreview, setNotesPreview] = useState<NotesPreviewState | null>(null);
  const [notesUpdatedAt, setNotesUpdatedAt] = useState("");
  // Transfer opens the dialer's transfer workflow ("Ask first" warm / blind)
  // in an overlay; completing it hands the call off and ends monitoring.
  const [transferOpen, setTransferOpen] = useState(false);

  useEffect(() => {
    if (notesPreview !== "loading") return;
    const id = window.setTimeout(() => {
      setNotesUpdatedAt(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
      setNotesPreview("ready");
    }, 1800);
    return () => window.clearTimeout(id);
  }, [notesPreview]);
  const { offset, onDragPointerDown } = useDragPosition();

  const isTakenOver = phase === "takenOver";

  useEffect(() => {
    if (isTakenOver) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isTakenOver]);

  useEffect(() => {
    if (!snackbarVisible) return;
    const id = window.setTimeout(() => setSnackbarVisible(false), 5000);
    return () => window.clearTimeout(id);
  }, [snackbarVisible]);

  const handleBarge = () => {
    setPhase("barged");
    setSupervisorMuted(false);
    setSnackbarVisible(true);
  };

  const handleStopBarge = () => {
    setPhase("listening");
    setSupervisorMuted(false);
    setSnackbarVisible(false);
  };

  const handleTakeOver = () => {
    setSnackbarVisible(false);
    setPhase("takenOver");
    onToast?.(`You've taken over the call from ${agentName}`);
  };

  /* ---------- taken-over: swap to the existing active-call dialpad ---------- */
  if (isTakenOver) {
    return (
      <div
        className="fixed z-[9998]"
        style={{
          right: 32,
          top: 96,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        data-testid="monitoring-dialpad-takeover"
      >
        <div className="relative">
          {/* Transparent drag strip over the dialpad's (inert) titlebar. */}
          <div
            className="absolute top-0 left-0 right-0 h-[28px] z-10 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={onDragPointerDown}
            data-testid="monitor-drag-handle-takeover"
          />
          <Dialer
            initialView="call"
            caller={{ name: customerPhone, phone: "", initials: "C", avatarBg }}
            style={{ minHeight: 0, width: "auto", background: "transparent", padding: 0 }}
            assetBasePath={assetBasePath}
            onToast={(t) => onToast?.(t.description ? `${t.title} — ${t.description}` : t.title)}
            onCallEnd={onClose}
          />
        </div>
      </div>
    );
  }

  const isBarged = phase === "barged";
  const isHuman = agentType === "Human";

  return (
    <TooltipPrimitive.Provider>
      <div
        className="fixed z-[9998]"
        style={{
          left: "50%",
          top: 80,
          transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
        }}
        data-testid="monitoring-call-window"
      >
        <div
          className="relative bg-white flex flex-col overflow-visible rounded-[8px] shadow-[0px_7px_8px_-4px_rgba(0,0,0,0.2),0px_12px_17px_2px_rgba(0,0,0,0.14),0px_5px_22px_4px_rgba(0,0,0,0.12)]"
          style={{
            width: panelCollapsed ? LEFT_W : WINDOW_W,
            height: WINDOW_H,
            transition: "width 200ms ease",
          }}
        >
          {isBarged && snackbarVisible && (
            <BargeSnackbar agentName={agentName} customerPhone={customerPhone} />
          )}
          <div className="w-full h-full overflow-hidden rounded-[8px] flex flex-col">
            <WindowTitleBar
              assets={assets}
              onClose={onClose}
              onDragPointerDown={onDragPointerDown}
            />
            <div className="flex flex-1 min-h-0 w-full">
              {/* ---------- LEFT: monitoring dialer ---------- */}
              <div
                className={`flex flex-col shrink-0 h-full ${panelCollapsed ? "" : "border-r border-[#e0e0e0]"}`}
                style={{ width: LEFT_W }}
                data-testid="monitoring-dialer-panel"
              >
                <div className="flex flex-col items-start px-[16px] w-full">
                  <MonitorHeaderRow
                    timer={formatTime(seconds)}
                    assets={assets}
                    panelCollapsed={panelCollapsed}
                    onTogglePanel={() => setPanelCollapsed((v) => !v)}
                  />
                  <MonitorProfile
                    agentName={agentName}
                    customerPhone={customerPhone}
                    avatarBg={avatarBg}
                  />
                </div>

                <div className="flex flex-col gap-[12px] items-center pt-[24px] px-[10px] w-full">
                  {/* Row 1: Mute / Keypad / Audio */}
                  <div className="flex items-start justify-center">
                    {isBarged ? (
                      <ActionButton
                        imgSrc={assets.mute}
                        imgAlt=""
                        label="Mute"
                        active={supervisorMuted}
                        onClick={() => setSupervisorMuted((v) => !v)}
                        testId="button-monitor-mute"
                      />
                    ) : (
                      <UnavailableTooltip>
                        <ActionButton
                          imgSrc={assets.mute}
                          imgAlt=""
                          label="Mute"
                          disabled
                          testId="button-monitor-mute"
                        />
                      </UnavailableTooltip>
                    )}
                    <UnavailableTooltip>
                      <ActionButton
                        imgSrc={assets.keypad}
                        imgAlt=""
                        label="Keypad"
                        disabled
                        testId="button-monitor-keypad"
                      />
                    </UnavailableTooltip>
                    <ActionButton
                      imgSrc={assets.audio}
                      imgAlt=""
                      label="Audio"
                      testId="button-monitor-audio"
                    />
                  </div>

                  {/* Row 2: Coach / Barge / Take over */}
                  <div className="flex items-start justify-center">
                    {isHuman && !isBarged ? (
                      <ActionButton
                        imgSrc={assets.coach}
                        imgAlt=""
                        label="Coach"
                        onClick={() => onToast?.("Coaching isn't available in this preview")}
                        testId="button-monitor-coach"
                      />
                    ) : (
                      <UnavailableTooltip
                        label={isHuman ? MONITORING_TOOLTIP : AI_AGENT_TOOLTIP}
                      >
                        <ActionButton
                          imgSrc={assets.coach}
                          imgAlt=""
                          label="Coach"
                          disabled
                          testId="button-monitor-coach"
                        />
                      </UnavailableTooltip>
                    )}
                    {isHuman ? (
                      <ActionButton
                        imgSrc={assets.barge}
                        imgAlt=""
                        label="Barge"
                        active={isBarged}
                        onClick={isBarged ? handleStopBarge : handleBarge}
                        testId="button-monitor-barge"
                      />
                    ) : (
                      <UnavailableTooltip label={AI_AGENT_TOOLTIP}>
                        <ActionButton
                          imgSrc={assets.barge}
                          imgAlt=""
                          label="Barge"
                          disabled
                          testId="button-monitor-barge"
                        />
                      </UnavailableTooltip>
                    )}
                    <ActionButton
                      imgSrc={assets.takeOver}
                      imgAlt=""
                      label="Take over"
                      onClick={handleTakeOver}
                      testId="button-monitor-take-over"
                    />
                  </div>

                  {/* Row 3: Transfer */}
                  <div className="flex items-start justify-center">
                    <ActionButton
                      imgSrc={assets.transfer}
                      imgAlt=""
                      label="Transfer"
                      onClick={() => setTransferOpen(true)}
                      testId="button-monitor-transfer"
                    />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-center pb-[24px] w-full">
                  <button
                    type="button"
                    onClick={onClose}
                    data-testid="button-monitor-end-call"
                    className="bg-[#e6413c] flex items-center justify-center rounded-full size-[56px] border-none cursor-pointer hover:bg-[#d93a35] active:scale-95 transition-all"
                    aria-label="End call"
                  >
                    <img alt="" className="size-[28px] block" src={assets.hangUp} />
                  </button>
                </div>
              </div>

              {/* ---------- RIGHT: Smart Notes / Transcript ---------- */}
              {!panelCollapsed && (
                <div
                  className="relative flex flex-col flex-1 min-w-0 h-full"
                  data-testid="monitoring-notes-panel"
                >
                  <PanelTabBar assets={assets} activeTab={activeTab} onTabChange={setActiveTab} />
                  {activeTab === "notes" && (
                    <NotesTranscriptPanel
                      assets={assets}
                      agentName={agentName}
                      avatarBg={avatarBg}
                      onPreviewNotes={() => setNotesPreview("loading")}
                    />
                  )}
                  {activeTab === "contact" && <ContactInfoPanel customerPhone={customerPhone} />}
                  {notesPreview && (
                    <NotesPreviewSheet
                      state={notesPreview}
                      lastUpdated={notesUpdatedAt}
                      onUpdate={() => setNotesPreview("loading")}
                      onClose={() => setNotesPreview(null)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer workflow overlay (same dialer flow used by AI Insights). */}
      {transferOpen && (
        <div
          onClick={() => setTransferOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          data-testid="overlay-monitor-transfer"
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
              assetBasePath={assetBasePath}
              onToast={(t) =>
                onToast?.(t.description ? `${t.title} — ${t.description}` : t.title)
              }
              onTransferBack={() => setTransferOpen(false)}
              onTransferComplete={() => {
                setTransferOpen(false);
                onClose();
              }}
              onCallEnd={() => setTransferOpen(false)}
            />
          </div>
        </div>
      )}
    </TooltipPrimitive.Provider>
  );
}
