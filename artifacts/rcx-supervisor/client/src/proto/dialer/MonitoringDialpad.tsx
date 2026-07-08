import { useEffect, useRef, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  ActionButton,
  Dialer,
  EndCallButton,
  buildAssets,
  type Assets,
} from "./Dialer";

/**
 * Monitoring dialpad popup (Figma: mLIWieGGOG574eVKpKA50f).
 *
 * States:
 * - AI (Air) agent listening        -> node 20:56542 ("monitoring dialpad" inside 4:109396,
 *                                      titlebar/menu chrome intentionally excluded)
 * - Human agent listen-only          -> node 1:139515 (disabled controls + tooltip)
 * - Human agent barged               -> node 1:139487 (active Unmute/Barge + snackbar)
 * - Taken over (Take over pressed)   -> swaps to the existing active-call dialpad (Dialer)
 *
 * The popup is intentionally non-modal (no backdrop) so the agent table stays
 * clickable and the existing monitor toggle semantics keep working: clicking
 * the monitor icon again stops monitoring, clicking another agent switches.
 */

export type MonitoringDialpadProps = {
  agentName: string;
  agentType: "Air" | "Human";
  /** Customer side of the monitored call (design shows a phone number). */
  customerPhone?: string;
  avatarBg?: string;
  /** Called whenever the popup should close (end call, close control). */
  onClose: () => void;
  /** Host flash-toast hook for secondary feedback. */
  onToast?: (message: string) => void;
  assetBasePath?: string;
};

type Phase = "listening" | "barged" | "takenOver";

const DEFAULT_CUSTOMER_PHONE = "(360) 765-2456";
const MONITORING_TOOLTIP = "Unavailable when monitoring";

type MonitorAssets = Assets & {
  unmute: string;
  coach: string;
  barge: string;
  takeOver: string;
};

function buildMonitorAssets(base: string): MonitorAssets {
  const p = base.replace(/\/$/, "");
  return {
    ...buildAssets(base),
    unmute: `${p}/icon-unmute-v2.svg`,
    coach: `${p}/icon-coach-v2.svg`,
    barge: `${p}/icon-barge-v2.svg`,
    takeOver: `${p}/icon-take-over-v2.svg`,
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

/* -------------------- DRAG SUPPORT -------------------- */

/**
 * Makes the floating window draggable by its title bar. Returns the current
 * translate offset and a pointerdown handler to attach to the drag handle.
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

/* -------------------- SMALL PIECES -------------------- */

function MonitorTitleBar({
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

function MonitorHeaderRow({ timer, assets }: { timer: string; assets: MonitorAssets }) {
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
      <button
        type="button"
        data-testid="button-monitor-pin"
        className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70 active:scale-90 transition-all"
        aria-label="Pin window"
      >
        <img alt="" className="size-[16px] block" src={assets.pinWindow} />
      </button>
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
      <div className="flex flex-col items-start">
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
function UnavailableTooltip({ children }: { children: React.ReactNode }) {
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
          {MONITORING_TOOLTIP}
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
      className="absolute left-1/2 -translate-x-1/2 top-[40px] z-20 bg-[#666666] rounded-[4px] px-[16px] py-[12px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]"
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

/* -------------------- MAIN COMPONENT -------------------- */

export function MonitoringDialpad({
  agentName,
  agentType,
  customerPhone = DEFAULT_CUSTOMER_PHONE,
  avatarBg = "#509ac4",
  onClose,
  onToast,
  assetBasePath = "/figmaAssets",
}: MonitoringDialpadProps) {
  const assets = buildMonitorAssets(assetBasePath);
  const [phase, setPhase] = useState<Phase>("listening");
  const [seconds, setSeconds] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [supervisorUnmuted, setSupervisorUnmuted] = useState(false);
  const { offset, onDragPointerDown } = useDragPosition();

  useEffect(() => {
    if (phase === "takenOver") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!snackbarVisible) return;
    const id = window.setTimeout(() => setSnackbarVisible(false), 5000);
    return () => window.clearTimeout(id);
  }, [snackbarVisible]);

  const handleBarge = () => {
    setPhase("barged");
    setSupervisorUnmuted(true);
    setSnackbarVisible(true);
  };

  const handleStopBarge = () => {
    setPhase("listening");
    setSupervisorUnmuted(false);
    setSnackbarVisible(false);
  };

  const handleTakeOver = () => {
    setSnackbarVisible(false);
    setPhase("takenOver");
    onToast?.(`You've taken over the call from ${agentName}`);
  };

  /* ---------- taken-over: swap to the existing active-call dialpad ---------- */
  if (phase === "takenOver") {
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
          right: 32,
          top: 96,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        data-testid="monitoring-dialpad"
      >
        <div
          className="relative bg-white flex flex-col items-center overflow-visible rounded-[8px] shadow-[0px_7px_8px_-4px_rgba(0,0,0,0.2),0px_12px_17px_2px_rgba(0,0,0,0.14),0px_5px_22px_4px_rgba(0,0,0,0.12)]"
          style={{ width: 280 }}
        >
          {isBarged && snackbarVisible && (
            <BargeSnackbar agentName={agentName} customerPhone={customerPhone} />
          )}
          <div className="w-full overflow-hidden rounded-[8px] flex flex-col items-center">
            <MonitorTitleBar
              assets={assets}
              onClose={onClose}
              onDragPointerDown={onDragPointerDown}
            />
            <div className="w-full h-[444px] flex flex-col">
              <div className="flex flex-col items-start px-[16px] w-full">
                <MonitorHeaderRow timer={formatTime(seconds)} assets={assets} />
                <MonitorProfile
                  agentName={agentName}
                  customerPhone={customerPhone}
                  avatarBg={avatarBg}
                />
              </div>

              <div className="flex flex-col gap-[12px] items-center pt-[24px] px-[20px] w-full">
                {/* Row 1: Unmute / Dialpad / Audio */}
                <div className="flex items-start justify-center">
                  {isBarged ? (
                    <ActionButton
                      imgSrc={assets.unmute}
                      imgAlt=""
                      label="Unmute"
                      active={supervisorUnmuted}
                      onClick={() => setSupervisorUnmuted((v) => !v)}
                      testId="button-monitor-unmute"
                    />
                  ) : (
                    <UnavailableTooltip>
                      <ActionButton
                        imgSrc={assets.unmute}
                        imgAlt=""
                        label="Unmute"
                        disabled
                        testId="button-monitor-unmute"
                      />
                    </UnavailableTooltip>
                  )}
                  <UnavailableTooltip>
                    <ActionButton
                      imgSrc={assets.keypad}
                      imgAlt=""
                      label="Dialpad"
                      disabled
                      testId="button-monitor-dialpad"
                    />
                  </UnavailableTooltip>
                  <ActionButton
                    imgSrc={assets.audio}
                    imgAlt=""
                    label="Audio"
                    testId="button-monitor-audio"
                  />
                </div>

                {/* Row 2: Take over (AI) | Coach / Barge / Take over (Human) */}
                <div className="flex items-start justify-center">
                  {isHuman ? (
                    <>
                      {isBarged ? (
                        <UnavailableTooltip>
                          <ActionButton
                            imgSrc={assets.coach}
                            imgAlt=""
                            label="Coach"
                            disabled
                            testId="button-monitor-coach"
                          />
                        </UnavailableTooltip>
                      ) : (
                        <ActionButton
                          imgSrc={assets.coach}
                          imgAlt=""
                          label="Coach"
                          onClick={() => onToast?.("Coaching isn't available in this preview")}
                          testId="button-monitor-coach"
                        />
                      )}
                      <ActionButton
                        imgSrc={assets.barge}
                        imgAlt=""
                        label="Barge"
                        active={isBarged}
                        onClick={isBarged ? handleStopBarge : handleBarge}
                        testId="button-monitor-barge"
                      />
                      <ActionButton
                        imgSrc={assets.takeOver}
                        imgAlt=""
                        label="Take over"
                        onClick={handleTakeOver}
                        testId="button-monitor-take-over"
                      />
                    </>
                  ) : (
                    <ActionButton
                      imgSrc={assets.takeOver}
                      imgAlt=""
                      label="Take over"
                      onClick={handleTakeOver}
                      testId="button-monitor-take-over"
                    />
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-center pb-[24px] w-full">
                <EndCallButton onClick={onClose} testId="button-monitor-end-call" assets={assets} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
}
