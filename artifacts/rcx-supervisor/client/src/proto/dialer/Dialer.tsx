import { useEffect, useRef, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

/* -------------------- PUBLIC TYPES -------------------- */

export type DialerContact = {
  id: string;
  name: string;
  ext?: string;
  phone?: string;
  initials: string;
  available?: boolean;
  onCall?: boolean;
  avatarBg?: string;
};

export type DialerCaller = {
  name: string;
  phone: string;
  initials: string;
  avatarBg?: string;
  to?: string;
};

export type DialerToast = {
  title: string;
  description?: string;
};

export type DialerEventHandlers = {
  onToast?: (toast: DialerToast) => void;
  onCallStart?: () => void;
  onCallEnd?: (reason: "self" | "everyone" | "leave") => void;
  onTransferStart?: (target: string) => void;
  onTransferComplete?: (target: string) => void;
  onTransferCancel?: () => void;
  onParticipantAdd?: (participantId: string) => void;
  onParticipantRemove?: (participantId: string) => void;
  onHoldChange?: (party: "customer" | "consult", onHold: boolean) => void;
  onRecordingChange?: (recording: boolean) => void;
};

export type DialerProps = DialerEventHandlers & {
  /** Contacts shown in the transfer search list. */
  contacts?: DialerContact[];
  /** Primary caller shown in the call view. Defaults to a demo caller. */
  caller?: DialerCaller;
  /** Caller used after a warm transfer is initiated. Defaults to a demo caller. */
  warmCaller?: DialerCaller;
  /**
   * Base URL where the dialer's SVG icons are served from.
   * Default: "/figmaAssets". Copy the package's `assets/figmaAssets/` folder
   * into your app's public dir, or override this prop to point elsewhere.
   */
  assetBasePath?: string;
  /** Wrapper className (applied to the outermost full-screen flex container). */
  className?: string;
  /** Inline style for the outermost wrapper. */
  style?: React.CSSProperties;
  /**
   * Which manage-call surface opens when the Hold action button is pressed.
   * - "v1" (default): the existing per-party Hold sheet.
   * - "v2": the merged Manage call sheet (one row per non-self party with
   *   inline hold-time badge).
   */
  manageCallMode?: "v1" | "v2" | "v3";
  /**
   * Which view the dialer opens on. Defaults to "call". Pass "transfer" to open
   * directly into the transfer workflow (e.g. when launched from a host
   * "Transfer" action that is already mid-call).
   */
  initialView?: "call" | "transfer" | "warm" | "conference";
  /**
   * Called when the user presses Back at the root of the transfer view. When
   * provided, it overrides the default (returning to the internal call view),
   * letting a host that launched the dialer directly into transfer (e.g. the
   * monitoring dialpad) intercept Back and return to its own surface.
   */
  onTransferBack?: () => void;
};

/* -------------------- DEFAULTS -------------------- */

const DEFAULT_CONTACTS: DialerContact[] = [
  { id: "c1", name: "James Avila", ext: "97655", initials: "JA", available: true, avatarBg: "#3690cc" },
  { id: "c2", name: "Department JAME_2", phone: "(650) 437-0359", initials: "DJ", avatarBg: "#3690cc" },
  { id: "c3", name: "Department_jame15", phone: "(650) 437-0359", initials: "D", avatarBg: "#3690cc" },
  { id: "c4", name: "Agent B", initials: "JD", available: true, avatarBg: "#3690cc" },
  { id: "c5", name: "James Lavent", initials: "JL", available: true, onCall: true, avatarBg: "#3690cc" },
  { id: "c6", name: "Department JAME 32", phone: "(650) 437-0359", initials: "DJ", avatarBg: "#3690cc" },
  { id: "c7", name: "Janet Cole", ext: "97712", initials: "JC", available: true, avatarBg: "#3690cc" },
  { id: "c8", name: "Sales Department", phone: "(650) 555-9090", initials: "S", avatarBg: "#3690cc" },
];

const DEFAULT_CALLER: DialerCaller = {
  name: "Andy Smith",
  phone: "(650) 555-1234",
  initials: "AS",
  avatarBg: "#509ac4",
  to: "Technical Support",
};

const DEFAULT_WARM_CALLER: DialerCaller = {
  name: "Jane Smith",
  phone: "(888) 528-7876",
  initials: "JS",
  avatarBg: "#3690cc",
};

const DIALABLE = /^[0-9*#+]$/;
const LETTER = /^[A-Za-z ]$/;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDialNumber(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)})`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
}

/* -------------------- ASSET CONTEXT -------------------- */

export type Assets = {
  mute: string;
  expandSp: string;
  controlRed: string;
  controlYellow: string;
  controlGreen: string;
  goodConnection: string;
  hd: string;
  rbnOff: string;
  pinWindow: string;
  headset: string;
  keypad: string;
  audio: string;
  requeue: string;
  hold: string;
  transfer: string;
  stopRec: string;
  dispositionGroup7: string;
  dispositionGroup23: string;
  hangUp: string;
  arrowBack: string;
  backspace: string;
  ret: string;
  checkCircle: string;
  helpCircle: string;
  arrowRight: string;
  voicemail: string;
  pauseBars: string;
  phoneFilled: string;
  hangupSmall: string;
  conferenceAvatar: string;
  peopleSmall: string;
  headsetSmall: string;
  checkGreenBadge: string;
  phoneOutlineSmall: string;
  personSilhouette: string;
  removeMember: string;
};

export function buildAssets(base: string): Assets {
  const p = base.replace(/\/$/, "");
  return {
    mute: `${p}/icon-mute.svg`,
    expandSp: `${p}/icon-expand-sp.svg`,
    controlRed: `${p}/control-red.svg`,
    controlYellow: `${p}/control-yellow.svg`,
    controlGreen: `${p}/control-green.svg`,
    goodConnection: `${p}/icon-good-connection-v2.svg`,
    hd: `${p}/icon-hd-v2.svg`,
    rbnOff: `${p}/icon-rbn-off-v2.svg`,
    pinWindow: `${p}/icon-pin-window-v2.svg`,
    headset: `${p}/headset-v2.svg`,
    keypad: `${p}/icon-keypad-v2.svg`,
    audio: `${p}/icon-audio-v2.svg`,
    requeue: `${p}/icon-requeue.svg`,
    hold: `${p}/icon-hold-v2.svg`,
    transfer: `${p}/icon-transfer-v2.svg`,
    stopRec: `${p}/icon-stop-rec.svg`,
    dispositionGroup7: `${p}/disposition-group7.svg`,
    dispositionGroup23: `${p}/disposition-group23.svg`,
    hangUp: `${p}/icon-hang-up-v2.svg`,
    arrowBack: `${p}/icon-arrow-back.svg`,
    backspace: `${p}/icon-backspace.svg`,
    ret: `${p}/icon-return.svg`,
    checkCircle: `${p}/icon-check-circle.svg`,
    helpCircle: `${p}/icon-ask-first.svg`,
    arrowRight: `${p}/icon-arrow-right.svg`,
    voicemail: `${p}/icon-voicemail.svg`,
    pauseBars: `${p}/icon-pause-bars.svg`,
    phoneFilled: `${p}/icon-phone-filled.svg`,
    hangupSmall: `${p}/icon-hangup-small.svg`,
    conferenceAvatar: `${p}/icon-conference-avatar.svg`,
    peopleSmall: `${p}/icon-people-small.svg`,
    headsetSmall: `${p}/icon-headset-small.svg`,
    checkGreenBadge: `${p}/icon-check-green-badge.svg`,
    phoneOutlineSmall: `${p}/icon-phone-outline-small.svg`,
    personSilhouette: `${p}/icon-person-silhouette.svg`,
    removeMember: `${p}/icon-remove-member.svg`,
  };
}

/* -------------------- SHARED BUTTONS -------------------- */

type ActionButtonProps = {
  imgSrc?: string;
  imgAlt: string;
  label: string;
  buttonBg?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
  children?: React.ReactNode;
  timerBadge?: { text: string; orange?: boolean; testId?: string };
  buttonRef?: React.Ref<HTMLButtonElement>;
};

export function ActionButton({
  imgSrc,
  imgAlt,
  label,
  buttonBg = "bg-[#f3f3f3]",
  active = false,
  disabled = false,
  onClick,
  testId,
  children,
  timerBadge,
  buttonRef,
}: ActionButtonProps) {
  const bgClass = disabled
    ? "bg-[#f3f3f3] opacity-50"
    : active
      ? "bg-[#d6e9f5]"
      : buttonBg;
  return (
    <div className="flex flex-col gap-[4px] items-center relative w-[80px]">
      <div className="relative">
        {timerBadge && (
          <span
            data-testid={timerBadge.testId}
            className={`absolute -top-[4px] -right-[10px] z-10 px-[6px] h-[18px] min-w-[18px] rounded-full border border-white flex items-center justify-center tabular-nums font-['Inter',sans-serif] font-semibold text-[10px] leading-[14px] text-white whitespace-nowrap ${
              timerBadge.orange ? "bg-[#d9803a]" : "bg-[#72757a]"
            }`}
          >
            {timerBadge.text}
          </span>
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          data-testid={testId}
          className={`${bgClass} ${
            active ? "ring-1 ring-[#a8d2ec]" : ""
          } flex items-center justify-center relative rounded-[999px] size-[56px] border-none transition-all duration-150 ${
            disabled
              ? "cursor-not-allowed"
              : "cursor-pointer hover:brightness-95 active:brightness-90 active:scale-95"
          }`}
          aria-label={label}
        >
          {children
            ? children
            : imgSrc
              ? <img alt={imgAlt} className={`size-[28px] block ${active ? "[filter:invert(31%)_sepia(91%)_saturate(1090%)_hue-rotate(178deg)_brightness(94%)_contrast(95%)]" : ""}`} src={imgSrc} />
              : null}
        </button>
      </div>
      <p
        className={`font-['Lato',sans-serif] leading-[16px] text-[12px] whitespace-nowrap select-none ${
          disabled ? "text-[#bdbdbd]" : active ? "font-bold text-[#121212]" : "text-[#121212]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

type FooterButtonProps = {
  label: string;
  iconSrc: string;
  iconAlt: string;
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
};

export function FooterButton({ label, iconSrc, iconAlt, disabled, onClick, testId }: FooterButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1 w-[80px]">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-testid={testId}
        className={`flex items-center justify-center size-[48px] rounded-full border-none transition-all duration-150 ${
          disabled
            ? "bg-[#ededed] cursor-not-allowed"
            : "bg-[#e0e0e0] cursor-pointer hover:bg-[#d2d2d2] active:scale-95"
        }`}
        aria-label={label}
      >
        <img alt={iconAlt} src={iconSrc} className={`size-[22px] block ${disabled ? "opacity-40" : ""}`} />
      </button>
      <span
        className={`text-[12px] font-['Lato',sans-serif] leading-[16px] ${
          disabled ? "text-[#bdbdbd]" : "text-[#121212]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

type KeyButtonProps = {
  digit: string;
  subLabel?: string;
  onPress: (d: string) => void;
};

export function KeyButton({ digit, subLabel, onPress }: KeyButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onPress(digit)}
      data-testid={`key-${digit}`}
      className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded-[8px] bg-transparent border-none cursor-pointer transition-colors hover:bg-[#f3f3f3] active:bg-[#e5e5e5] select-none"
      aria-label={`Dial ${digit}`}
    >
      <span className="font-['Lato',sans-serif] text-[24px] leading-[28px] font-normal text-[#121212]">
        {digit}
      </span>
      <span className="font-['Lato',sans-serif] text-[9px] leading-[10px] tracking-[1px] text-[#666666] uppercase h-[10px] mt-[2px]">
        {subLabel || "\u00A0"}
      </span>
    </button>
  );
}

const KEYS: Array<[string, string?]> = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

export function NumericKeypad({ onDigit }: { onDigit: (d: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-1 w-full">
      {KEYS.map(([d, sub]) => (
        <div key={d} className="flex justify-center">
          <KeyButton digit={d} subLabel={sub} onPress={onDigit} />
        </div>
      ))}
    </div>
  );
}

/* -------------------- SHARED LAYOUT PIECES -------------------- */

export function TitleBar({ assets }: { assets: Assets }) {
  return (
    <div className="h-[28px] relative shrink-0 w-full bg-white border-b border-[#0000001a]">
      <div className="absolute left-[8px] top-1/2 -translate-y-1/2 flex gap-[8px]">
        <button type="button" data-testid="button-close" className="size-[12px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 active:scale-90 transition-all" aria-label="Close">
          <img alt="" className="size-[12px] block" src={assets.controlRed} />
        </button>
        <button type="button" data-testid="button-minimize" className="size-[12px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 active:scale-90 transition-all" aria-label="Minimize">
          <img alt="" className="size-[12px] block" src={assets.controlYellow} />
        </button>
        <button type="button" data-testid="button-maximize" className="size-[12px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 active:scale-90 transition-all" aria-label="Maximize">
          <img alt="" className="size-[12px] block" src={assets.controlGreen} />
        </button>
      </div>
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Lato',sans-serif] font-bold text-[13px] text-[#121212] whitespace-nowrap select-none">
        RingCX phone call
      </p>
    </div>
  );
}

export function TopStatusRow({ timer, assets }: { timer: string; assets: Assets }) {
  return (
    <div className="flex h-[36px] items-center justify-between w-full">
      <div className="flex gap-[4px] items-center">
        <time data-testid="text-timer" className="font-['Lato',sans-serif] font-bold leading-[20px] text-[14px] text-[#121212] whitespace-nowrap tabular-nums">
          {timer}
        </time>
        <div className="flex gap-[4px] items-center">
          <img alt="Good connection" className="size-[16px]" src={assets.goodConnection} />
          <img alt="HD" className="size-[16px]" src={assets.hd} />
          <img alt="RBN off" className="size-[16px]" src={assets.rbnOff} />
        </div>
      </div>
      <div className="flex gap-[8px] items-center">
        <button type="button" data-testid="button-pin" className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70 active:scale-90 transition-all" aria-label="Pin window">
          <img alt="" className="size-[16px] block" src={assets.pinWindow} />
        </button>
        <button type="button" data-testid="button-expand" className="size-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-70 active:scale-90 transition-all" aria-label="Expand">
          <div className="rotate-180">
            <img alt="" className="size-[16px] block" src={assets.expandSp} />
          </div>
        </button>
      </div>
    </div>
  );
}

export function EndCallButton({ onClick, testId = "button-end-call", assets }: { onClick?: () => void; testId?: string; assets: Assets }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="bg-[#e6413c] flex items-center justify-center rounded-full size-[56px] border-none cursor-pointer hover:bg-[#d93a35] active:scale-95 transition-all"
      aria-label="End call"
    >
      <img alt="" className="size-[28px] block" src={assets.hangUp} />
    </button>
  );
}

function DispositionIcon({ assets }: { assets: Assets }) {
  return (
    <div className="h-[24px] relative w-[27px]">
      <div className="absolute inset-[7.96%_33.61%_6.52%_7%]">
        <div className="absolute inset-[-4.38%_-5.61%]">
          <img alt="" className="block size-full" src={assets.dispositionGroup7} />
        </div>
      </div>
      <div className="absolute inset-[24.68%_8.43%_23.51%_45.97%]">
        <div className="absolute inset-[-7.01%_-8.33%_-1.75%_0]">
          <img alt="" className="block size-full" src={assets.dispositionGroup23} />
        </div>
      </div>
    </div>
  );
}

type ActionState = {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  testIdPrefix?: string;
};

type ActionGridProps = {
  mute?: ActionState;
  keypad?: ActionState;
  audio?: ActionState;
  requeue?: ActionState;
  hold?: ActionState & { label?: string; timerBadge?: { text: string; orange?: boolean; testId?: string }; buttonRef?: React.Ref<HTMLButtonElement> };
  transfer?: ActionState;
  stopRec?: ActionState;
  disposition?: ActionState;
  testIdPrefix?: string;
  assets: Assets;
};

function ActionGrid({
  mute = {},
  keypad = {},
  audio = {},
  requeue = {},
  hold = {},
  transfer = {},
  stopRec = {},
  disposition = {},
  testIdPrefix = "",
  assets,
}: ActionGridProps) {
  const p = testIdPrefix ? `${testIdPrefix}-` : "";
  return (
    <div className="flex flex-col gap-[12px] items-start">
      <div className="flex items-center justify-center">
        <ActionButton imgSrc={assets.mute} imgAlt="Mute" label="Mute" testId={`button-${p}mute`} {...mute} />
        <ActionButton imgSrc={assets.keypad} imgAlt="Keypad" label="Keypad" testId={`button-${p}keypad`} {...keypad} />
        <ActionButton imgSrc={assets.audio} imgAlt="Audio" label="Audio" testId={`button-${p}audio`} {...audio} />
      </div>
      <div className="flex items-center justify-center">
        <ActionButton imgSrc={assets.requeue} imgAlt="Requeue" label="Requeue" testId={`button-${p}requeue`} {...requeue} />
        <ActionButton imgSrc={assets.hold} imgAlt={hold.label ?? "Hold"} label={hold.label ?? "Hold"} testId={`button-${p}hold`} {...hold} />
        <ActionButton imgSrc={assets.transfer} imgAlt="Transfer" label="Transfer" testId={`button-${p}transfer`} {...transfer} />
      </div>
      <div className="flex items-center justify-center">
        <ActionButton
          imgSrc={assets.stopRec}
          imgAlt="Stop recording"
          label="Stop Rec"
          buttonBg="bg-[rgba(190,57,51,0.12)]"
          testId={`button-${p}stop-rec`}
          {...stopRec}
        />
        <ActionButton imgAlt="Disposition" label="Disposition" testId={`button-${p}disposition`} {...disposition}>
          <DispositionIcon assets={assets} />
        </ActionButton>
        <div className="w-[80px]" />
      </div>
    </div>
  );
}

type DialSuggestionRowProps = {
  number: string;
  dialed: boolean;
  onDial: () => void;
  assets: Assets;
};

function DialSuggestionRow({ number, dialed, onDial, assets }: DialSuggestionRowProps) {
  return (
    <button
      type="button"
      onClick={dialed ? undefined : onDial}
      data-testid="button-dial-suggestion"
      className={`w-full flex items-center gap-3 px-4 py-2 border-none cursor-pointer text-left transition-colors ${
        dialed
          ? "bg-[rgba(102,102,102,0.18)]"
          : "bg-[rgba(102,102,102,0.12)] hover:bg-[rgba(102,102,102,0.16)] active:bg-[rgba(102,102,102,0.2)]"
      }`}
      aria-label={dialed ? "Dialed" : `Dial ${formatDialNumber(number)}`}
    >
      <div className="size-[36px] rounded-full bg-[#3690cc] flex items-center justify-center shrink-0">
        <img src={assets.personSilhouette} alt="" className="size-[22px]" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="font-['Lato',sans-serif] font-bold text-[14px] leading-[18px] text-[#121212]">
          Dial:
        </span>
        <span
          className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] truncate"
          data-testid="text-dial-number"
        >
          {formatDialNumber(number)}
        </span>
      </div>
      <div className="shrink-0 pr-1">
        {dialed ? (
          <img src={assets.checkCircle} alt="Dialed" className="size-[22px]" data-testid="icon-dial-check" />
        ) : (
          <img src={assets.ret} alt="" className="size-[22px]" data-testid="icon-dial-return" />
        )}
      </div>
    </button>
  );
}

type ContactRowProps = {
  contact: DialerContact;
  selected: boolean;
  onSelect: () => void;
  assets: Assets;
};

export function ContactRow({ contact, selected, onSelect, assets }: ContactRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`row-contact-${contact.id}`}
      className={`w-full flex items-center gap-3 px-4 py-2 border-none cursor-pointer text-left transition-colors ${
        selected ? "bg-[#f3f3f3]" : "bg-white hover:bg-[#f9f9f9] active:bg-[#f3f3f3]"
      }`}
      aria-pressed={selected}
    >
      <div className="relative shrink-0">
        <div
          className="size-[36px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: contact.avatarBg ?? "#3690cc" }}
        >
          <span className="font-['Lato',sans-serif] font-bold text-[13px] text-white select-none">
            {contact.initials}
          </span>
        </div>
        {contact.available && (
          <img
            src={assets.checkGreenBadge}
            alt=""
            className="absolute -bottom-0.5 -right-0.5 size-[12px]"
            data-testid={`badge-available-${contact.id}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#121212] truncate">
          {contact.name}
        </span>
        {(contact.ext || contact.phone) && (
          <span className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] truncate">
            {contact.ext ? `Ext. ${contact.ext}` : contact.phone}
          </span>
        )}
      </div>
      <div className="shrink-0 pr-1 flex items-center">
        {selected ? (
          <img src={assets.checkCircle} alt="Selected" className="size-[22px]" />
        ) : contact.onCall ? (
          <img src={assets.headsetSmall} alt="On call" className="size-[20px]" />
        ) : null}
      </div>
    </button>
  );
}

export function ContactList({
  query,
  selectedId,
  onSelect,
  emptyMessage = "No matching contacts",
  contacts,
  assets,
}: {
  query: string;
  selectedId: string | null;
  onSelect: (c: DialerContact) => void;
  emptyMessage?: string | null;
  contacts: DialerContact[];
  assets: Assets;
}) {
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/[^0-9]/g, "");
  const results = q.length === 0
    ? contacts
    : contacts.filter((c) => {
        if (c.name.toLowerCase().includes(q)) return true;
        if (qDigits.length > 0) {
          const ext = (c.ext ?? "").replace(/[^0-9]/g, "");
          const phone = (c.phone ?? "").replace(/[^0-9]/g, "");
          if (ext.includes(qDigits) || phone.includes(qDigits)) return true;
        }
        return false;
      });
  if (results.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="px-4 py-4 text-center font-['Lato',sans-serif] text-[13px] text-[#666666]" data-testid="text-no-contacts">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto" data-testid="list-contacts">
      {results.map((c, i) => (
        <div key={c.id} className={i > 0 ? "border-t border-[#ececec]" : ""}>
          <ContactRow contact={c} selected={selectedId === c.id} onSelect={() => onSelect(c)} assets={assets} />
        </div>
      ))}
    </div>
  );
}

type TransferFooterProps = {
  dialed: boolean;
  onAskFirst: () => void;
  onTransfer: () => void;
  assets: Assets;
};

function TransferFooter({ dialed, onAskFirst, onTransfer, assets }: TransferFooterProps) {
  return (
    <div className="flex items-start justify-center gap-4 pb-5 pt-3 px-4">
      <FooterButton label="Ask first" iconSrc={assets.helpCircle} iconAlt="" disabled={!dialed} onClick={onAskFirst} testId="button-ask-first" />
      <FooterButton label="Transfer" iconSrc={assets.transfer} iconAlt="" disabled={!dialed} onClick={onTransfer} testId="button-transfer-confirm" />
      <FooterButton label="To voicemail" iconSrc={assets.voicemail} iconAlt="" disabled testId="button-to-voicemail" />
    </div>
  );
}

/* -------------------- ROOT -------------------- */

type View = "call" | "transfer" | "warm" | "conference";

export function Dialer(props: DialerProps): JSX.Element {
  const {
    contacts = DEFAULT_CONTACTS,
    caller = DEFAULT_CALLER,
    warmCaller = DEFAULT_WARM_CALLER,
    assetBasePath = "/figmaAssets",
    className,
    style,
    onToast,
    onCallStart,
    onCallEnd,
    onTransferStart,
    onTransferComplete,
    onTransferCancel,
    onParticipantAdd,
    onParticipantRemove,
    onHoldChange,
    onRecordingChange,
    manageCallMode = "v1",
    initialView = "call",
    onTransferBack,
  } = props;

  const assets = buildAssets(assetBasePath);
  const toast = (t: DialerToast) => onToast?.(t);

  const [seconds, setSeconds] = useState(0);
  const [view, setView] = useState<View>(initialView);
  const [enteredNumber, setEnteredNumber] = useState("");
  const [dialed, setDialed] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [warmNumber, setWarmNumber] = useState("");
  const [warmName, setWarmName] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [holdStartedAt, setHoldStartedAt] = useState<number | null>(null);
  const [holdElapsed, setHoldElapsed] = useState(0);
  const [consultHoldStartedAt, setConsultHoldStartedAt] = useState<number | null>(null);
  const [consultHoldElapsed, setConsultHoldElapsed] = useState(0);
  const [holdSheetOpen, setHoldSheetOpen] = useState(false);
  const holdTriggerRef = useRef<HTMLButtonElement | null>(null);
  const holdSheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onCallStart?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (holdStartedAt == null) {
      setHoldElapsed(0);
      return;
    }
    const tick = () => setHoldElapsed(Math.max(0, Math.floor((Date.now() - holdStartedAt) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [holdStartedAt]);

  useEffect(() => {
    if (consultHoldStartedAt == null) {
      setConsultHoldElapsed(0);
      return;
    }
    const tick = () =>
      setConsultHoldElapsed(Math.max(0, Math.floor((Date.now() - consultHoldStartedAt) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [consultHoldStartedAt]);

  const customerOnHold = holdStartedAt !== null;
  const consultOnHold = consultHoldStartedAt !== null;
  const holdText = formatTime(holdElapsed);
  const holdOverThreshold = holdElapsed >= 60;
  const consultHoldText = formatTime(consultHoldElapsed);
  const consultHoldOverThreshold = consultHoldElapsed >= 60;
  const toggleCustomerHold = () => {
    setHoldStartedAt((h) => {
      const next = h == null ? Date.now() : null;
      toast({
        title: next == null ? "Customer resumed" : "Customer placed on hold",
        description: next == null ? "The customer is back on the line." : "The customer can no longer hear you.",
      });
      onHoldChange?.("customer", next != null);
      return next;
    });
  };
  const toggleConsultHold = () => {
    setConsultHoldStartedAt((h) => {
      const next = h == null ? Date.now() : null;
      toast({
        title: next != null ? "Consult party on hold" : "Consult party resumed",
      });
      onHoldChange?.("consult", next != null);
      return next;
    });
  };
  const openHoldSheet = () => setHoldSheetOpen(true);

  const prevManageCallModeRef = useRef(manageCallMode);
  useEffect(() => {
    const prev = prevManageCallModeRef.current;
    // Close the sheet when switching to a mode whose sheet shape differs
    // from the previous one — same downgrade behavior v2 already had.
    if (prev !== manageCallMode) {
      setHoldSheetOpen(false);
    }
    prevManageCallModeRef.current = manageCallMode;
  }, [manageCallMode]);

  useEffect(() => {
    if (!holdSheetOpen) return;
    const sheet = holdSheetRef.current;
    const focusables = sheet
      ? Array.from(
          sheet.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];
    focusables[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHoldSheetOpen(false);
        return;
      }
      if (e.key === "Tab" && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      holdTriggerRef.current?.focus();
    };
  }, [holdSheetOpen]);

  const viewRef = useRef(view);
  const dialedRef = useRef(dialed);
  const enteredRef = useRef(enteredNumber);
  const transferBackRef = useRef<() => void>(() => {});
  viewRef.current = view;
  dialedRef.current = dialed;
  enteredRef.current = enteredNumber;

  const selectedContact = selectedContactId
    ? contacts.find((c) => c.id === selectedContactId) ?? null
    : null;
  const isSearchMode = /[A-Za-z]/.test(enteredNumber);
  const transferReady = dialed || selectedContact !== null;

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (view !== "warm") return;
    const id = window.setTimeout(() => setView("conference"), 4000);
    return () => window.clearTimeout(id);
  }, [view]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const inTransfer = viewRef.current === "transfer";
      if (DIALABLE.test(e.key)) {
        e.preventDefault();
        setEnteredNumber((n) => (n.length >= 30 ? n : n + e.key));
        setDialed(false);
        setSelectedContactId(null);
      } else if (inTransfer && LETTER.test(e.key)) {
        e.preventDefault();
        setEnteredNumber((n) => (n.length >= 30 ? n : n + e.key));
        setDialed(false);
        setSelectedContactId(null);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setEnteredNumber((n) => n.slice(0, -1));
        setDialed(false);
        setSelectedContactId(null);
      } else if (e.key === "Enter") {
        if (inTransfer && !dialedRef.current && enteredRef.current.length > 0 && !/[A-Za-z]/.test(enteredRef.current)) {
          setDialed(true);
        }
      } else if (e.key === "Escape") {
        if (inTransfer) transferBackRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleDigit = (d: string) => {
    setEnteredNumber((n) => (n.length >= 30 ? n : n + d));
    setDialed(false);
    setSelectedContactId(null);
  };
  const handleBackspace = () => {
    setEnteredNumber((n) => n.slice(0, -1));
    setDialed(false);
    setSelectedContactId(null);
  };
  const handleSearchChange = (val: string) => {
    setEnteredNumber(val.slice(0, 30));
    setDialed(false);
    setSelectedContactId(null);
  };
  const handleSelectContact = (c: DialerContact) => {
    setSelectedContactId(c.id);
  };

  const goToTransfer = () => setView("transfer");

  const resetTransferState = () => {
    setEnteredNumber("");
    setDialed(false);
    setWarmNumber("");
    setWarmName("");
    setSelectedContactId(null);
    setHoldStartedAt(null);
    setConsultHoldStartedAt(null);
    setHoldSheetOpen(false);
  };

  const goBackToCall = () => {
    resetTransferState();
    setView("call");
  };
  // Back from the transfer root: if a host launched us directly into transfer
  // (e.g. the monitoring dialpad), let it reclaim control instead of falling
  // through to the internal call view.
  const handleTransferBack = () => {
    if (onTransferBack) {
      resetTransferState();
      onTransferBack();
      return;
    }
    goBackToCall();
  };
  transferBackRef.current = handleTransferBack;
  const handleDial = () => {
    if (enteredNumber.length > 0) setDialed(true);
  };
  const handleAskFirst = () => {
    const target = selectedContact
      ? selectedContact.ext
        ? `Ext. ${selectedContact.ext}`
        : selectedContact.phone ?? selectedContact.name
      : formatDialNumber(enteredNumber);
    setWarmNumber(target);
    setWarmName(selectedContact?.name ?? "");
    setView("warm");
    setEnteredNumber("");
    setDialed(false);
    setSelectedContactId(null);
    setHoldStartedAt(Date.now());
    onTransferStart?.(target);
    onHoldChange?.("customer", true);
  };
  const handleTransferNow = () => {
    const target = selectedContact?.name ?? formatDialNumber(enteredNumber);
    toast({
      title: "Call transferred",
      description: `Transferred to ${target}.`,
    });
    onTransferComplete?.(target);
    resetTransferState();
    setView("call");
  };
  const handleEndConsult = () => {
    toast({ title: "Consult ended", description: "Returned to the original caller." });
    onTransferCancel?.();
    resetTransferState();
    setView("call");
  };
  const handleEndAll = () => {
    resetTransferState();
    setView("call");
    setSeconds(0);
    onCallEnd?.("self");
  };
  const handleEndForEveryone = () => {
    toast({ title: "Call ended for all participants" });
    onCallEnd?.("everyone");
    resetTransferState();
    setView("call");
    setSeconds(0);
  };
  const handleLeaveConference = () => {
    toast({
      title: "You left the conference",
      description: "Other participants remain on the call.",
    });
    onCallEnd?.("leave");
    resetTransferState();
    setView("call");
    setSeconds(0);
  };
  const handleCancelTransfer = () => {
    toast({ title: "Transfer cancelled" });
    onTransferCancel?.();
    setWarmNumber("");
    setWarmName("");
    setView("call");
  };

  return (
    <TooltipPrimitive.Provider>
      <div
        className={`min-h-screen w-full flex items-center justify-center bg-[#f5f5f5] p-4${className ? ` ${className}` : ""}`}
        style={style}
      >
        <div
          className="bg-white flex flex-col items-center overflow-hidden relative rounded-[8px] shadow-[0px_7px_8px_-4px_rgba(0,0,0,0.2),0px_12px_17px_2px_rgba(0,0,0,0.14),0px_5px_22px_4px_rgba(0,0,0,0.12)]"
          style={{ width: 280 }}
          data-testid="dialpad-root"
        >
          <TitleBar assets={assets} />
          {view === "call" && (
            <CallView
              timer={formatTime(seconds)}
              keypadOpen={keypadOpen}
              enteredNumber={enteredNumber}
              onToggleKeypad={() => setKeypadOpen((o) => !o)}
              onTransfer={goToTransfer}
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onEndCall={handleEndAll}
              customerOnHold={customerOnHold}
              holdText={holdText}
              holdOverThreshold={holdOverThreshold}
              onOpenHoldSheet={openHoldSheet}
              holdTriggerRef={holdTriggerRef}
              caller={caller}
              assets={assets}
            />
          )}
          {view === "transfer" && (
            <TransferView
              enteredNumber={enteredNumber}
              dialed={dialed}
              isSearchMode={isSearchMode}
              selectedContactId={selectedContactId}
              transferReady={transferReady}
              onBack={handleTransferBack}
              onBackspace={handleBackspace}
              onDial={handleDial}
              onDigit={handleDigit}
              onSearchChange={handleSearchChange}
              onSelectContact={handleSelectContact}
              onAskFirst={handleAskFirst}
              onTransfer={handleTransferNow}
              contacts={contacts}
              assets={assets}
            />
          )}
          {view === "warm" && (
            <WarmTransferView
              timer={formatTime(seconds)}
              transferNumber={warmNumber}
              consultName={warmName}
              onEndConsult={handleEndConsult}
              onEndAll={handleEndAll}
              customerOnHold={customerOnHold}
              holdText={holdText}
              holdOverThreshold={holdOverThreshold}
              onOpenHoldSheet={openHoldSheet}
              holdTriggerRef={holdTriggerRef}
              warmCaller={warmCaller}
              assets={assets}
            />
          )}
          {view === "conference" && (
            <ConferenceView
              timer={formatTime(seconds)}
              onEndForEveryone={handleEndForEveryone}
              onLeaveConference={handleLeaveConference}
              onCancelTransfer={handleCancelTransfer}
              warmConsultNumber={warmNumber}
              customerOnHold={customerOnHold}
              holdText={holdText}
              holdOverThreshold={holdOverThreshold}
              onOpenHoldSheet={openHoldSheet}
              holdTriggerRef={holdTriggerRef}
              warmCaller={warmCaller}
              onToast={toast}
              onParticipantAdd={onParticipantAdd}
              onParticipantRemove={onParticipantRemove}
              onRecordingChange={onRecordingChange}
              assets={assets}
            />
          )}

          {holdSheetOpen && (
            manageCallMode === "v3" ? (
              <ManageCallSheetV3
                sheetRef={holdSheetRef}
                onClose={() => setHoldSheetOpen(false)}
                participants={buildHoldParticipants({
                  view,
                  customerOnHold,
                  holdText,
                  holdOverThreshold,
                  holdSeconds: holdElapsed,
                  consultOnHold,
                  consultHoldText,
                  consultHoldOverThreshold,
                  consultHoldSeconds: consultHoldElapsed,
                  warmNumber,
                  warmName,
                  caller,
                  warmCaller,
                })}
                onToggle={(id) => {
                  if (id === "customer") toggleCustomerHold();
                  else if (id === "consult") toggleConsultHold();
                }}
                onDisconnect={(id) => {
                  if (id === "consult") {
                    handleCancelTransfer();
                    setHoldSheetOpen(false);
                  }
                }}
                assets={assets}
              />
            ) : manageCallMode === "v2" ? (
              <ManageCallSheet
                sheetRef={holdSheetRef}
                onClose={() => setHoldSheetOpen(false)}
                participants={buildHoldParticipants({
                  view,
                  customerOnHold,
                  holdText,
                  holdOverThreshold,
                  consultOnHold,
                  consultHoldText,
                  consultHoldOverThreshold,
                  warmNumber,
                  warmName,
                  caller,
                  warmCaller,
                })}
                onToggle={(id) => {
                  if (id === "customer") toggleCustomerHold();
                  else if (id === "consult") toggleConsultHold();
                }}
                assets={assets}
              />
            ) : (
              <HoldSheet
                sheetRef={holdSheetRef}
                onClose={() => setHoldSheetOpen(false)}
                participants={buildHoldParticipants({
                  view,
                  customerOnHold,
                  holdText,
                  holdOverThreshold,
                  consultOnHold,
                  consultHoldText,
                  consultHoldOverThreshold,
                  warmNumber,
                  warmName,
                  caller,
                  warmCaller,
                })}
                onToggle={(id) => {
                  if (id === "customer") toggleCustomerHold();
                  else if (id === "consult") toggleConsultHold();
                }}
                assets={assets}
              />
            )
          )}
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
}

export type HoldParticipant = {
  id: "customer" | "consult";
  name: string;
  subtitle: string;
  initials?: string;
  isUnknown?: boolean;
  avatarBg: string;
  onHold: boolean;
  holdMeta?: { text: string; orange: boolean; seconds?: number };
  /** v3 role label (e.g. "Customer", "Agent"). */
  role?: "customer" | "agent";
  /** v3 phone number / extension shown under the name. */
  phone?: string;
};

function buildHoldParticipants(args: {
  view: View;
  customerOnHold: boolean;
  holdText: string;
  holdOverThreshold: boolean;
  /** Optional raw seconds on hold; used by v3 to derive color thresholds. */
  holdSeconds?: number;
  consultOnHold: boolean;
  consultHoldText?: string;
  consultHoldOverThreshold?: boolean;
  consultHoldSeconds?: number;
  warmNumber: string;
  warmName: string;
  caller: DialerCaller;
  warmCaller: DialerCaller;
}): HoldParticipant[] {
  const c = args.view === "call" ? args.caller : args.warmCaller;
  const customer: HoldParticipant = {
    id: "customer",
    name: c.name,
    subtitle: "Active call",
    initials: c.initials,
    avatarBg: c.avatarBg ?? "#3690cc",
    onHold: args.customerOnHold,
    holdMeta: args.customerOnHold
      ? { text: args.holdText, orange: args.holdOverThreshold, seconds: args.holdSeconds }
      : undefined,
    role: "customer",
    phone: c.phone,
  };
  if (args.view === "conference") {
    const consult: HoldParticipant = {
      id: "consult",
      name: args.warmName || args.warmNumber || "Consult",
      subtitle: "Active call",
      isUnknown: !args.warmName,
      initials: args.warmName
        ? args.warmName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()
        : undefined,
      avatarBg: "#3690cc",
      onHold: args.consultOnHold,
      holdMeta: args.consultOnHold
        ? {
            text: args.consultHoldText ?? "00:00",
            orange: args.consultHoldOverThreshold ?? false,
            seconds: args.consultHoldSeconds,
          }
        : undefined,
      role: "agent",
      phone: args.warmNumber,
    };
    return [customer, consult];
  }
  return [customer];
}

type HoldSheetProps = {
  sheetRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  participants: HoldParticipant[];
  onToggle: (id: HoldParticipant["id"]) => void;
  assets: Assets;
};

export function HoldSheet({ sheetRef, onClose, participants, onToggle, assets }: HoldSheetProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close hold panel"
        data-testid="overlay-hold"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(0,0,0,0.18)] border-none p-0 m-0 cursor-pointer"
      />
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[12px] shadow-[0_-6px_16px_rgba(0,0,0,0.12)] flex flex-col"
        style={{ maxHeight: "78%" }}
        data-testid="sheet-hold"
        role="dialog"
        aria-modal="true"
        aria-label="Hold"
      >
        <div className="flex items-center px-4 pt-3 pb-2">
          <p className="font-['Lato',sans-serif] font-bold text-[15px] leading-[20px] text-[#121212]">
            Hold
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pb-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-2"
              data-testid={`row-hold-${p.id}`}
            >
              <div
                className="size-[36px] rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: p.avatarBg }}
              >
                {p.isUnknown ? (
                  <img src={assets.personSilhouette} alt="" className="size-[22px]" />
                ) : (
                  <span className="font-['Lato',sans-serif] font-bold text-[12px] text-white select-none">
                    {p.initials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#121212] truncate">
                    {p.name}
                  </span>
                </div>
                {(p.subtitle || p.holdMeta) && (
                  <span
                    className={`font-['Lato',sans-serif] text-[12px] leading-[16px] truncate ${
                      p.holdMeta?.orange ? "text-[#e6743c]" : "text-[#666666]"
                    }`}
                  >
                    {p.holdMeta ? `On hold · ${p.holdMeta.text}` : p.subtitle}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggle(p.id)}
                data-testid={`button-hold-toggle-${p.id}`}
                aria-pressed={p.onHold}
                aria-label={p.onHold ? `Resume ${p.name}` : `Hold ${p.name}`}
                className={`group shrink-0 size-[36px] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
                  p.onHold
                    ? "bg-[#d6e9f5] ring-1 ring-[#a8d2ec] hover:bg-[#c6dff0] active:bg-[#b6d5ea]"
                    : "bg-transparent ring-1 ring-[#d0d0d0] hover:bg-[#d6e9f5] hover:ring-[#a8d2ec] active:bg-[#c6dff0]"
                }`}
              >
                <img
                  src={p.onHold ? assets.pauseBars : assets.hold}
                  alt=""
                  className={`size-[16px] ${
                    p.onHold
                      ? "[filter:invert(31%)_sepia(91%)_saturate(1090%)_hue-rotate(178deg)_brightness(94%)_contrast(95%)]"
                      : "group-hover:[filter:invert(31%)_sepia(91%)_saturate(1090%)_hue-rotate(178deg)_brightness(94%)_contrast(95%)]"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function ManageCallSheet({ sheetRef, onClose, participants, onToggle, assets }: HoldSheetProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close manage call panel"
        data-testid="overlay-manage-call"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(0,0,0,0.18)] border-none p-0 m-0 cursor-pointer"
      />
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[12px] shadow-[0_-6px_16px_rgba(0,0,0,0.12)] flex flex-col"
        style={{ maxHeight: "78%" }}
        data-testid="sheet-manage-call"
        role="dialog"
        aria-modal="true"
        aria-label="Manage call"
      >
        <div className="flex items-center px-4 pt-3 pb-2">
          <p className="font-['Lato',sans-serif] font-bold text-[15px] leading-[20px] text-[#121212]">
            Manage call
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pb-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-2"
              data-testid={`row-manage-${p.id}`}
            >
              <div
                className="size-[36px] rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: p.avatarBg }}
              >
                {p.isUnknown ? (
                  <img src={assets.personSilhouette} alt="" className="size-[22px]" />
                ) : (
                  <span className="font-['Lato',sans-serif] font-bold text-[12px] text-white select-none">
                    {p.initials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#121212] truncate">
                  {p.name}
                </span>
              </div>
              {p.holdMeta && (
                <span
                  data-testid={`text-manage-hold-timer-${p.id}`}
                  className={`shrink-0 px-[6px] h-[18px] min-w-[18px] rounded-full border border-white flex items-center justify-center tabular-nums font-['Inter',sans-serif] font-semibold text-[10px] leading-[14px] text-white whitespace-nowrap ${
                    p.holdMeta.orange ? "bg-[#d9803a]" : "bg-[#72757a]"
                  }`}
                >
                  {p.holdMeta.text}
                </span>
              )}
              <button
                type="button"
                onClick={() => onToggle(p.id)}
                data-testid={`button-manage-toggle-${p.id}`}
                aria-pressed={p.onHold}
                aria-label={p.onHold ? `Resume ${p.name}` : `Hold ${p.name}`}
                className={`shrink-0 size-[36px] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
                  p.onHold
                    ? "bg-[#d6e9f5] hover:bg-[#c6dff0] active:bg-[#b6d5ea]"
                    : "bg-[#f3f3f3] hover:bg-[#e8e8e8] active:bg-[#dcdcdc]"
                }`}
              >
                <img
                  src={assets.pauseBars}
                  alt=""
                  className={`size-[16px] ${
                    p.onHold
                      ? "[filter:invert(31%)_sepia(91%)_saturate(1090%)_hue-rotate(178deg)_brightness(94%)_contrast(95%)]"
                      : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------- MANAGE CALL SHEET (v3) -------------------- */

type ManageCallSheetV3Props = {
  sheetRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  participants: HoldParticipant[];
  onToggle: (id: HoldParticipant["id"]) => void;
  onDisconnect: (id: HoldParticipant["id"]) => void;
  assets: Assets;
};

function holdSecondsClass(seconds: number | undefined): string {
  if (seconds == null) return "text-[#8a6a3a]";
  if (seconds >= 300) return "text-[#c4302b]";
  if (seconds >= 120) return "text-[#d97706]";
  return "text-[#8a6a3a]";
}

function roleLabel(role: HoldParticipant["role"]): string {
  if (role === "customer") return "Customer";
  if (role === "agent") return "Agent";
  return "";
}

type RowMenuAction = {
  key: string;
  label: string;
  enabled: boolean;
  destructive?: boolean;
  disabledHint?: string;
  onClick?: () => void;
};

function RowOverflowMenu({
  participantId,
  participantName,
  actions,
}: {
  participantId: string;
  participantName: string;
  actions: RowMenuAction[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("mousedown", handlePointer);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid={`menu-manage-row-${participantId}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${participantName}`}
        className="size-[32px] rounded-full flex items-center justify-center border-none bg-transparent text-[#5b5f66] hover:bg-[#eef0f3] hover:text-[#121212] active:bg-[#e3e6ea] cursor-pointer transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.6" />
          <circle cx="8" cy="8" r="1.6" />
          <circle cx="8" cy="13" r="1.6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Actions for ${participantName}`}
          data-testid={`menu-manage-row-popup-${participantId}`}
          className="absolute right-0 bottom-[38px] z-10 min-w-[216px] rounded-[10px] border border-[#e2e5e9] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.16)] py-1.5"
        >
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              role="menuitem"
              disabled={!a.enabled}
              title={!a.enabled ? a.disabledHint : undefined}
              data-testid={`menu-item-${a.key}-${participantId}`}
              onClick={() => {
                if (!a.enabled) return;
                setOpen(false);
                a.onClick?.();
              }}
              className={`w-full text-left px-3.5 py-2 font-['Lato',sans-serif] text-[13px] leading-[18px] border-none bg-transparent ${
                !a.enabled
                  ? "text-[#a8acb3] cursor-not-allowed"
                  : a.destructive
                    ? "text-[#c4302b] hover:bg-[#fbeaea] cursor-pointer"
                    : "text-[#121212] hover:bg-[#f3f5f8] cursor-pointer"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantRowV3({
  p,
  emphasis,
  onToggle,
  onDisconnect,
  assets,
}: {
  p: HoldParticipant;
  emphasis: "primary" | "secondary";
  onToggle: (id: HoldParticipant["id"]) => void;
  onDisconnect: (id: HoldParticipant["id"]) => void;
  assets: Assets;
}) {
  const avatarSize = emphasis === "primary" ? "size-[44px]" : "size-[36px]";
  const initialsSize = emphasis === "primary" ? "text-[14px]" : "text-[12px]";
  const nameSize = emphasis === "primary" ? "text-[15px]" : "text-[14px]";
  const role = roleLabel(p.role);
  const holdColor = holdSecondsClass(p.holdMeta?.seconds);
  const actions: RowMenuAction[] = [
    {
      key: "disconnect",
      label: "Disconnect from call",
      enabled: p.id === "consult",
      destructive: true,
      disabledHint:
        p.id === "customer"
          ? "End the call to disconnect the customer."
          : undefined,
      onClick: () => onDisconnect(p.id),
    },
    {
      key: "mute",
      label: "Mute",
      enabled: false,
      disabledHint: "Mute is not available yet.",
    },
    {
      key: "voicemail",
      label: "Send to voicemail",
      enabled: false,
      disabledHint: "Send to voicemail is not available yet.",
    },
    {
      key: "view-contact",
      label: "View contact",
      enabled: false,
      disabledHint: "Contact view is not available yet.",
    },
  ];

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      data-testid={`row-manage-v3-${p.id}`}
    >
      <div className="relative shrink-0">
        <div
          className={`${avatarSize} rounded-full flex items-center justify-center`}
          style={{ backgroundColor: p.avatarBg }}
        >
          {p.isUnknown ? (
            <img src={assets.personSilhouette} alt="" className="size-[22px]" />
          ) : (
            <span
              className={`font-['Lato',sans-serif] font-bold ${initialsSize} text-white select-none`}
            >
              {p.initials}
            </span>
          )}
        </div>
        {p.onHold && (
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 size-[14px] rounded-full bg-[#f5b945] ring-2 ring-white flex items-center justify-center"
          >
            <svg width="6" height="8" viewBox="0 0 6 8" fill="#fff" aria-hidden="true">
              <rect x="0" y="0" width="2" height="8" rx="0.5" />
              <rect x="4" y="0" width="2" height="8" rx="0.5" />
            </svg>
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span
          className={`font-['Lato',sans-serif] font-bold ${nameSize} leading-[20px] text-[#121212] truncate`}
          data-testid={`text-manage-v3-name-${p.id}`}
        >
          {p.name}
        </span>
        <span className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#5b5f66] truncate">
          {[role, p.phone].filter(Boolean).join(" · ")}
        </span>
        {p.onHold && (
          <span
            data-testid={`text-manage-v3-hold-${p.id}`}
            aria-live="polite"
            className={`mt-0.5 font-['Lato',sans-serif] font-semibold text-[12px] leading-[16px] tabular-nums truncate ${holdColor}`}
          >
            {p.holdMeta ? `On hold · ${p.holdMeta.text}` : "On hold"}
          </span>
        )}
      </div>
      {p.onHold ? (
        <button
          type="button"
          onClick={() => onToggle(p.id)}
          data-testid={`button-manage-resume-${p.id}`}
          aria-label={`Resume ${p.name}`}
          className="shrink-0 h-[34px] px-4 rounded-full bg-[#066fac] text-white font-['Lato',sans-serif] font-bold text-[13px] leading-[16px] border-none cursor-pointer hover:bg-[#055d92] active:bg-[#04527f] transition-colors shadow-[0_1px_2px_rgba(6,111,172,0.25)]"
        >
          Resume
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onToggle(p.id)}
          data-testid={`button-manage-hold-${p.id}`}
          aria-label={`Hold ${p.name}`}
          className="shrink-0 h-[34px] px-4 rounded-full bg-white text-[#066fac] font-['Lato',sans-serif] font-bold text-[13px] leading-[16px] border border-[#cfd9e1] cursor-pointer hover:bg-[#f0f7fb] hover:border-[#066fac] active:bg-[#e2eff7] transition-colors"
        >
          Hold
        </button>
      )}
      <RowOverflowMenu
        participantId={p.id}
        participantName={p.name}
        actions={actions}
      />
    </div>
  );
}

export function ManageCallSheetV3({
  sheetRef,
  onClose,
  participants,
  onToggle,
  onDisconnect,
  assets,
}: ManageCallSheetV3Props) {
  const onCall = participants.filter((p) => !p.onHold);
  const onHold = participants.filter((p) => p.onHold);
  const total = participants.length;
  // Sort customer first within each section.
  const sortCustomerFirst = (a: HoldParticipant, b: HoldParticipant) =>
    (a.role === "customer" ? 0 : 1) - (b.role === "customer" ? 0 : 1);
  onCall.sort(sortCustomerFirst);
  onHold.sort(sortCustomerFirst);

  const otherParties = participants.length - 1;
  const showBulkActions = otherParties >= 3;
  const collapsed = participants.length === 1;
  const solo = collapsed ? participants[0] : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close manage call panel"
        data-testid="overlay-manage-call-v3"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(0,0,0,0.18)] border-none p-0 m-0 cursor-pointer"
      />
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[16px] shadow-[0_-8px_24px_rgba(16,24,40,0.16)] flex flex-col overflow-hidden"
        style={{ maxHeight: "82%" }}
        data-testid="sheet-manage-call-v3"
        role="dialog"
        aria-modal="true"
        aria-label="Call participants"
      >
        <div className="flex flex-col items-center pt-2 pb-1">
          <span aria-hidden="true" className="h-[4px] w-[36px] rounded-full bg-[#e2e5e9]" />
        </div>
        <div className="flex items-baseline justify-between px-5 pt-2 pb-3">
          <p
            className="font-['Lato',sans-serif] font-bold text-[16px] leading-[22px] text-[#121212]"
            data-testid="text-manage-v3-header"
          >
            Call participants
          </p>
          <span className="font-['Lato',sans-serif] text-[13px] leading-[18px] text-[#5b5f66] tabular-nums">
            {total} {total === 1 ? "person" : "people"}
          </span>
        </div>

        {collapsed && solo ? (
          <div className="px-5 pb-5" data-testid="region-manage-v3-solo">
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <div className="relative">
                <div
                  className="size-[64px] rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: solo.avatarBg }}
                >
                  {solo.isUnknown ? (
                    <img src={assets.personSilhouette} alt="" className="size-[36px]" />
                  ) : (
                    <span className="font-['Lato',sans-serif] font-bold text-[20px] text-white select-none">
                      {solo.initials}
                    </span>
                  )}
                </div>
                {solo.onHold && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 -right-0.5 size-[20px] rounded-full bg-[#f5b945] ring-2 ring-white flex items-center justify-center"
                  >
                    <svg width="8" height="10" viewBox="0 0 6 8" fill="#fff" aria-hidden="true">
                      <rect x="0" y="0" width="2" height="8" rx="0.5" />
                      <rect x="4" y="0" width="2" height="8" rx="0.5" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-3 font-['Lato',sans-serif] font-bold text-[16px] leading-[22px] text-[#121212] truncate max-w-full">
                {solo.name}
              </p>
              <p className="font-['Lato',sans-serif] text-[13px] leading-[18px] text-[#5b5f66] truncate max-w-full">
                {[roleLabel(solo.role), solo.phone].filter(Boolean).join(" · ")}
              </p>
              {solo.onHold && (
                <p
                  data-testid={`text-manage-v3-hold-${solo.id}`}
                  aria-live="polite"
                  className={`mt-1 font-['Lato',sans-serif] font-semibold text-[13px] leading-[18px] tabular-nums ${holdSecondsClass(solo.holdMeta?.seconds)}`}
                >
                  {solo.holdMeta ? `On hold · ${solo.holdMeta.text}` : "On hold"}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onToggle(solo.id)}
              data-testid={`button-manage-solo-toggle-${solo.id}`}
              aria-pressed={solo.onHold}
              aria-label={solo.onHold ? `Resume ${solo.name}` : `Hold ${solo.name}`}
              className={`w-full h-[44px] rounded-[10px] font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] cursor-pointer transition-colors ${
                solo.onHold
                  ? "bg-[#066fac] text-white border-none hover:bg-[#055d92] active:bg-[#04527f] shadow-[0_1px_2px_rgba(6,111,172,0.25)]"
                  : "bg-white text-[#066fac] border border-[#cfd9e1] hover:bg-[#f0f7fb] hover:border-[#066fac] active:bg-[#e2eff7]"
              }`}
            >
              {solo.onHold ? "Resume customer" : "Place customer on hold"}
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pb-2">
            {onCall.length > 0 && (
              <section
                aria-label="On the call"
                data-testid="region-manage-v3-on-call"
                className="pt-1"
              >
                <div className="flex items-center gap-2 px-5 pt-2 pb-1.5">
                  <span aria-hidden="true" className="size-[6px] rounded-full bg-[#22a06b]" />
                  <h3 className="font-['Lato',sans-serif] font-bold text-[11px] leading-[14px] uppercase tracking-[0.06em] text-[#5b5f66]">
                    On the call
                  </h3>
                  <span className="font-['Lato',sans-serif] text-[11px] leading-[14px] text-[#8a8f96] tabular-nums">
                    {onCall.length}
                  </span>
                </div>
                <div className="px-1">
                  {onCall.map((p) => (
                    <ParticipantRowV3
                      key={p.id}
                      p={p}
                      emphasis={p.role === "customer" ? "primary" : "secondary"}
                      onToggle={onToggle}
                      onDisconnect={onDisconnect}
                      assets={assets}
                    />
                  ))}
                </div>
              </section>
            )}
            {onHold.length > 0 && (
              <section
                aria-label="On hold"
                data-testid="region-manage-v3-on-hold"
                className={`${onCall.length > 0 ? "mt-2" : ""} bg-[#fbf6ee] border-t border-b border-[#f1e6d0]`}
              >
                <div className="flex items-center gap-2 px-5 pt-2.5 pb-1.5">
                  <span aria-hidden="true" className="size-[6px] rounded-full bg-[#f5b945]" />
                  <h3 className="font-['Lato',sans-serif] font-bold text-[11px] leading-[14px] uppercase tracking-[0.06em] text-[#8a6a3a]">
                    On hold
                  </h3>
                  <span className="font-['Lato',sans-serif] text-[11px] leading-[14px] text-[#a98d5a] tabular-nums">
                    {onHold.length}
                  </span>
                </div>
                <div className="px-1 pb-1">
                  {onHold.map((p) => (
                    <ParticipantRowV3
                      key={p.id}
                      p={p}
                      emphasis={p.role === "customer" ? "primary" : "secondary"}
                      onToggle={onToggle}
                      onDisconnect={onDisconnect}
                      assets={assets}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {showBulkActions && (
          <div
            className="flex items-center gap-2 px-5 py-3 border-t border-[#eef0f3] bg-white"
            data-testid="region-manage-v3-bulk"
          >
            <button
              type="button"
              onClick={() => {
                participants
                  .filter((p) => !p.onHold)
                  .slice(1)
                  .forEach((p) => onToggle(p.id));
              }}
              data-testid="button-manage-v3-hold-others"
              aria-label="Hold all other participants"
              className="flex-1 h-[38px] rounded-[10px] bg-white border border-[#cfd9e1] text-[#066fac] font-['Lato',sans-serif] font-bold text-[13px] leading-[16px] cursor-pointer hover:bg-[#f0f7fb] hover:border-[#066fac] active:bg-[#e2eff7] transition-colors"
            >
              Hold all others
            </button>
            <button
              type="button"
              onClick={() => {
                participants
                  .filter((p) => p.onHold)
                  .forEach((p) => onToggle(p.id));
              }}
              data-testid="button-manage-v3-resume-all"
              aria-label="Resume all participants"
              className="flex-1 h-[38px] rounded-[10px] bg-[#066fac] text-white font-['Lato',sans-serif] font-bold text-[13px] leading-[16px] border-none cursor-pointer hover:bg-[#055d92] active:bg-[#04527f] transition-colors shadow-[0_1px_2px_rgba(6,111,172,0.25)]"
            >
              Resume all
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------- CALL VIEW -------------------- */

type CallViewProps = {
  timer: string;
  keypadOpen: boolean;
  enteredNumber: string;
  onToggleKeypad: () => void;
  onTransfer: () => void;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onEndCall: () => void;
  customerOnHold: boolean;
  holdText: string;
  holdOverThreshold: boolean;
  onOpenHoldSheet: () => void;
  holdTriggerRef?: React.Ref<HTMLButtonElement>;
  caller: DialerCaller;
  assets: Assets;
};

function CallView({ timer, keypadOpen, enteredNumber, onToggleKeypad, onTransfer, onDigit, onBackspace, onEndCall, customerOnHold, holdText, holdOverThreshold, onOpenHoldSheet, holdTriggerRef, caller, assets }: CallViewProps) {
  return (
    <div className="w-full h-[490px] flex flex-col">
      <div className="flex flex-col items-start px-[16px] w-full">
        <TopStatusRow timer={timer} assets={assets} />
        <div className="flex gap-[12px] items-start pb-[12px] pt-[10px] w-full">
          <div
            className="flex items-center justify-center rounded-full size-[48px] shrink-0"
            style={{ backgroundColor: caller.avatarBg ?? "#509ac4" }}
          >
            <p className="font-['Lato',sans-serif] font-bold leading-[28px] text-[20px] text-white">{caller.initials}</p>
          </div>
          <div className="flex flex-col gap-[8px] items-start">
            <div className="flex flex-col items-start">
              <p data-testid="text-caller-name" className="font-['Lato',sans-serif] font-bold leading-[24px] text-[16px] text-[#121212]">
                {caller.name}
              </p>
              <p className="font-['Lato',sans-serif] leading-[16px] text-[12px] text-black">{caller.phone}</p>
            </div>
            {caller.to && (
              <div className="flex gap-[8px] items-center">
                <p className="font-['Lato',sans-serif] leading-[13.2px] text-[11px] text-[#666666]">To: {caller.to}</p>
                <img alt="" className="size-[16px]" src={assets.headset} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center pb-[24px] pt-[12px] px-[24px] w-full min-h-[371px]">
        {keypadOpen ? (
          <div className="w-full flex flex-col items-center gap-3 flex-1">
            <div data-testid="text-entered-number" className="w-full min-h-[36px] flex items-center justify-between gap-2 border-b border-[#e5e5e5] pb-2">
              <span className="font-['Lato',sans-serif] font-bold text-[18px] text-[#121212] truncate">
                {enteredNumber || <span className="text-[#bdbdbd] font-normal text-[14px]">Type a number…</span>}
              </span>
              {enteredNumber && (
                <button type="button" onClick={onBackspace} data-testid="button-keypad-backspace" className="p-1 rounded hover:bg-[#f3f3f3] active:bg-[#e5e5e5] cursor-pointer border-none bg-transparent" aria-label="Backspace">
                  <img src={assets.backspace} alt="" className="size-[18px]" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {KEYS.map(([d, sub]) => (<KeyButton key={d} digit={d} subLabel={sub} onPress={onDigit} />))}
            </div>
            <button type="button" onClick={onToggleKeypad} data-testid="button-close-keypad" className="mt-auto font-['Lato',sans-serif] text-[12px] text-[#066fac] bg-transparent border-none cursor-pointer hover:underline">
              Close keypad
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-[24px] items-center">
            <ActionGrid
              assets={assets}
              keypad={{ onClick: onToggleKeypad, active: keypadOpen }}
              transfer={{ onClick: onTransfer }}
              hold={{
                onClick: onOpenHoldSheet,
                buttonRef: holdTriggerRef,
                active: customerOnHold,
                label: customerOnHold ? "Unhold" : "Hold",
                timerBadge: customerOnHold
                  ? { text: holdText, orange: holdOverThreshold, testId: "text-hold-timer" }
                  : undefined,
              }}
            />
            <EndCallButton onClick={onEndCall} assets={assets} />
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- TRANSFER VIEW -------------------- */

type TransferViewProps = {
  enteredNumber: string;
  dialed: boolean;
  isSearchMode: boolean;
  selectedContactId: string | null;
  transferReady: boolean;
  onBack: () => void;
  onBackspace: () => void;
  onDial: () => void;
  onDigit: (d: string) => void;
  onSearchChange: (val: string) => void;
  onSelectContact: (c: DialerContact) => void;
  onAskFirst: () => void;
  onTransfer: () => void;
  contacts: DialerContact[];
  assets: Assets;
};

function TransferView({
  enteredNumber,
  dialed,
  isSearchMode,
  selectedContactId,
  transferReady,
  onBack,
  onBackspace,
  onDial,
  onDigit,
  onSearchChange,
  onSelectContact,
  onAskFirst,
  onTransfer,
  contacts,
  assets,
}: TransferViewProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const hasText = enteredNumber.length > 0;
  const displayValue = enteredNumber;
  return (
    <div className="w-full h-[490px] flex flex-col">
      <div className="bg-[#f3f3f3] px-4 pt-2 pb-3 flex flex-col shrink-0">
        <p className="font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#121212] h-[28px] flex items-center">
          Transfer
        </p>
        <div className="flex items-center gap-1 h-[40px] pt-1">
          <button
            type="button"
            onClick={onBack}
            data-testid="button-transfer-back"
            className="shrink-0 size-[28px] flex items-center justify-center rounded hover:bg-[#e5e5e5] active:bg-[#d8d8d8] border-none bg-transparent cursor-pointer transition-colors"
            aria-label="Back to call"
          >
            <img src={assets.arrowBack} alt="" className="size-[20px]" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Enter a name or number"
            data-testid="input-transfer-search"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-center font-['Lato',sans-serif] text-[15px] leading-[20px] text-[#121212] placeholder:text-[#757575] placeholder:font-normal font-medium px-2"
            aria-label="Search contacts or enter number"
          />
          {hasText && (
            <button
              type="button"
              onClick={onBackspace}
              data-testid="button-transfer-backspace"
              className="shrink-0 size-[28px] flex items-center justify-center rounded hover:bg-[#e5e5e5] active:bg-[#d8d8d8] border-none bg-transparent cursor-pointer transition-colors"
              aria-label="Backspace"
            >
              <img src={assets.backspace} alt="" className="size-[18px]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {hasText ? (
          <>
            {!isSearchMode && (
              <div className="shrink-0">
                <DialSuggestionRow number={enteredNumber} dialed={dialed} onDial={onDial} assets={assets} />
              </div>
            )}
            <ContactList
              query={enteredNumber}
              selectedId={selectedContactId}
              onSelect={onSelectContact}
              emptyMessage="No matching contacts"
              contacts={contacts}
              assets={assets}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6 pt-4 pb-3">
            <NumericKeypad onDigit={onDigit} />
          </div>
        )}
      </div>

      <TransferFooter dialed={transferReady} onAskFirst={onAskFirst} onTransfer={onTransfer} assets={assets} />
    </div>
  );
}

/* -------------------- WARM TRANSFER -------------------- */

type WarmTransferViewProps = {
  timer: string;
  transferNumber: string;
  consultName?: string;
  onEndConsult: () => void;
  onEndAll: () => void;
  customerOnHold: boolean;
  holdText: string;
  holdOverThreshold: boolean;
  onOpenHoldSheet: () => void;
  holdTriggerRef?: React.Ref<HTMLButtonElement>;
  warmCaller: DialerCaller;
  assets: Assets;
};

function WarmTransferView({ timer, transferNumber, consultName, onEndConsult, onEndAll, customerOnHold, holdText, holdOverThreshold, onOpenHoldSheet, holdTriggerRef, warmCaller, assets }: WarmTransferViewProps) {
  return (
    <div className="w-full h-[490px] flex flex-col">
      <div className="flex flex-col items-start px-[16px] w-full">
        <TopStatusRow timer={timer} assets={assets} />

        <div className="flex items-center gap-2 w-full pt-1">
          <div data-testid="pill-transfer-number" className="flex items-center gap-2 bg-[#f3f3f3] rounded-full pl-3 pr-4 h-[40px] flex-1 min-w-0">
            <img src={assets.phoneOutlineSmall} alt="" className="size-[18px] shrink-0" />
            <span className="font-['Lato',sans-serif] text-[14px] text-[#121212] truncate flex-1">
              {consultName || transferNumber || "Consult"}
            </span>
          </div>
          <button
            type="button"
            onClick={onEndConsult}
            data-testid="button-end-consult"
            className="size-[40px] rounded-full bg-[#e6413c] flex items-center justify-center border-none cursor-pointer hover:bg-[#d93a35] active:scale-95 transition-all shrink-0"
            aria-label="End consult"
          >
            <img src={assets.hangUp} alt="" className="size-[18px]" />
          </button>
        </div>

        <div className="flex items-center justify-between w-full pt-3 pb-3">
          <p data-testid="text-warm-caller" className="font-['Lato',sans-serif] text-[14px] leading-[20px] text-[#121212]">
            Caller: {warmCaller.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center pb-[24px] pt-[4px] px-[24px] w-full flex-1">
        <ActionGrid
          assets={assets}
          testIdPrefix="warm"
          requeue={{ disabled: true }}
          hold={{
            onClick: onOpenHoldSheet,
            buttonRef: holdTriggerRef,
            active: customerOnHold,
            label: customerOnHold ? "Unhold" : "Hold",
            timerBadge: customerOnHold
              ? { text: holdText, orange: holdOverThreshold, testId: "text-warm-hold-timer" }
              : undefined,
          }}
          transfer={{ disabled: true }}
          stopRec={{ disabled: true }}
        />
        <div className="flex-1" />
        <EndCallButton onClick={onEndAll} testId="button-warm-end-call" assets={assets} />
      </div>
    </div>
  );
}

/* -------------------- CONFERENCE -------------------- */

type ConferenceViewProps = {
  timer: string;
  onEndForEveryone: () => void;
  onLeaveConference: () => void;
  onCancelTransfer: () => void;
  warmConsultNumber: string;
  customerOnHold: boolean;
  holdText: string;
  holdOverThreshold: boolean;
  onOpenHoldSheet: () => void;
  holdTriggerRef?: React.Ref<HTMLButtonElement>;
  warmCaller: DialerCaller;
  onToast: (t: DialerToast) => void;
  onParticipantAdd?: (participantId: string) => void;
  onParticipantRemove?: (participantId: string) => void;
  onRecordingChange?: (recording: boolean) => void;
  assets: Assets;
};

type EndCallChoice = "everyone" | "just-me" | "cancel-transfer";

type Participant = {
  id: string;
  name: string;
  subtitle: string;
  initials?: string;
  isCaller?: boolean;
  isSelf?: boolean;
  isUnknown?: boolean;
  avatarBg?: string;
};

function ConferenceView({ timer, onEndForEveryone, onLeaveConference, onCancelTransfer, warmConsultNumber, customerOnHold, holdText, holdOverThreshold, onOpenHoldSheet, holdTriggerRef, warmCaller, onToast, onParticipantRemove, onRecordingChange, assets }: ConferenceViewProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "p1", name: warmCaller.name, subtitle: "", initials: warmCaller.initials, isCaller: true, avatarBg: warmCaller.avatarBg ?? "#3690cc" },
    { id: "p2", name: "Me", subtitle: "", initials: "ME", isSelf: true, avatarBg: "#3690cc" },
    { id: "p3", name: warmConsultNumber || "+91 (97) 91945238", subtitle: "", isUnknown: true, avatarBg: "#3690cc" },
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [endCallOpen, setEndCallOpen] = useState(false);
  const cancelTransferAvailable =
    warmConsultNumber.length > 0 && participants.some((p) => p.isUnknown);
  const [endCallChoice, setEndCallChoice] = useState<EndCallChoice>("just-me");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const endCallTriggerRef = useRef<HTMLButtonElement | null>(null);
  const endCallSheetRef = useRef<HTMLDivElement | null>(null);

  const openEndCallSheet = () => {
    setEndCallChoice("just-me");
    setEndCallOpen(true);
  };

  const handleConfirmEndCall = () => {
    setEndCallOpen(false);
    if (endCallChoice === "everyone") {
      onEndForEveryone();
    } else if (endCallChoice === "just-me") {
      onLeaveConference();
    } else {
      setParticipants((list) => list.filter((p) => !p.isUnknown));
      onCancelTransfer();
    }
  };

  useEffect(() => {
    if (!endCallOpen) return;
    const sheet = endCallSheetRef.current;
    const focusables = sheet
      ? Array.from(
          sheet.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];
    focusables[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEndCallOpen(false);
        return;
      }
      if (e.key === "Tab" && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      endCallTriggerRef.current?.focus();
    };
  }, [endCallOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    const sheet = sheetRef.current;
    const focusables = sheet
      ? Array.from(
          sheet.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];
    focusables[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheetOpen(false);
        return;
      }
      if (e.key === "Tab" && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [sheetOpen]);

  const handleStopRec = () => {
    setIsRecording((r) => {
      const next = !r;
      onToast({
        title: next ? "Recording resumed" : "Recording stopped",
        description: next ? "This call is being recorded." : "Recording has been stopped.",
      });
      onRecordingChange?.(next);
      return next;
    });
  };

  const handleRemove = (p: Participant) => {
    if (p.isSelf) {
      setSheetOpen(false);
      onLeaveConference();
      return;
    }
    setParticipants((list) => list.filter((x) => x.id !== p.id));
    onParticipantRemove?.(p.id);
    onToast({ title: "Removed from call", description: `${p.name} was disconnected.` });
  };

  return (
    <div className="w-full h-[490px] flex flex-col relative">
      <div className="flex flex-col items-start px-[16px] w-full">
        <TopStatusRow timer={timer} assets={assets} />

        <div className="flex gap-[12px] items-start pb-[6px] pt-[10px] w-full">
          <div className="bg-[#3690cc] flex items-center justify-center rounded-full size-[48px] shrink-0">
            <img src={assets.conferenceAvatar} alt="" className="size-[28px]" />
          </div>
          <div className="flex flex-col items-start gap-1">
            <p data-testid="text-conference-name" className="font-['Lato',sans-serif] font-bold leading-[20px] text-[16px] text-[#121212]">
              {warmCaller.name}
            </p>
            <div className="flex items-center gap-[6px]">
              <p className="font-['Lato',sans-serif] leading-[18px] text-[13px] text-[#121212]">
                Conference call
              </p>
            </div>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <button
                  ref={triggerRef}
                  type="button"
                  data-testid="badge-participants"
                  onClick={() => setSheetOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={sheetOpen}
                  aria-label={`Participants (${participants.length})`}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#cccccc] bg-white cursor-pointer hover:bg-[#f3f3f3] active:bg-[#ececec] transition-colors"
                >
                  <img src={assets.peopleSmall} alt="" className="size-[12px]" />
                  <span className="font-['Lato',sans-serif] text-[12px] leading-[14px] text-[#121212]">
                    {participants.length}
                  </span>
                </button>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side="bottom"
                  sideOffset={6}
                  className="bg-[#121212] text-white border-none rounded-[4px] px-2 py-1 text-[12px] font-['Lato',sans-serif] z-50"
                  data-testid="tooltip-participants"
                >
                  Participants ({participants.length})
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center pb-[24px] pt-[12px] px-[24px] w-full flex-1">
        <ActionGrid
          assets={assets}
          testIdPrefix="conf"
          hold={{
            onClick: onOpenHoldSheet,
            buttonRef: holdTriggerRef,
            active: customerOnHold,
            label: customerOnHold ? "Unhold" : "Hold",
            timerBadge: customerOnHold
              ? { text: holdText, orange: holdOverThreshold, testId: "text-conf-hold-timer" }
              : undefined,
          }}
          stopRec={{
            onClick: handleStopRec,
            active: !isRecording,
          }}
        />
        <div className="flex-1" />
        <button
          ref={endCallTriggerRef}
          type="button"
          onClick={openEndCallSheet}
          data-testid="button-conf-end-call"
          className="bg-[#e6413c] flex items-center justify-center rounded-full size-[56px] border-none cursor-pointer hover:bg-[#d93a35] active:scale-95 transition-all"
          aria-label="End call"
        >
          <img alt="" className="size-[28px] block" src={assets.hangUp} />
        </button>
      </div>

      {endCallOpen && (
        <>
          <button
            type="button"
            aria-label="Close end call options"
            data-testid="overlay-end-call"
            onClick={() => setEndCallOpen(false)}
            className="absolute inset-0 bg-[rgba(0,0,0,0.18)] border-none p-0 m-0 cursor-pointer"
          />
          <div
            ref={endCallSheetRef}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[12px] shadow-[0_-6px_16px_rgba(0,0,0,0.12)] flex flex-col px-4 pt-4 pb-4"
            data-testid="sheet-end-call"
            role="dialog"
            aria-modal="true"
            aria-label="End call"
          >
            <p className="font-['Lato',sans-serif] font-bold text-[18px] leading-[24px] text-[#121212] pb-3">
              End call
            </p>
            <div
              role="radiogroup"
              aria-label="End call options"
              className="flex flex-col gap-3 pb-4"
            >
              {([
                { value: "everyone", label: "Everyone", testId: "radio-end-everyone" },
                { value: "just-me", label: "Just me", testId: "radio-end-just-me" },
                ...(cancelTransferAvailable
                  ? [
                      {
                        value: "cancel-transfer",
                        label: `Cancel transfer: ${warmConsultNumber}`,
                        testId: "radio-end-cancel-transfer",
                      },
                    ]
                  : []),
              ] as { value: EndCallChoice; label: string; testId: string }[]).map((opt) => {
                const selected = endCallChoice === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-testid={opt.testId}
                    onClick={() => setEndCallChoice(opt.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setEndCallChoice(opt.value);
                        handleConfirmEndCall();
                      }
                    }}
                    className="flex items-start gap-3 w-full bg-transparent border-none p-0 text-left cursor-pointer"
                  >
                    <span
                      className={`mt-0.5 size-[20px] rounded-full border-[2px] flex items-center justify-center shrink-0 ${
                        selected ? "border-[#066fac]" : "border-[#666666]"
                      }`}
                    >
                      {selected && (
                        <span className="size-[10px] rounded-full bg-[#066fac]" />
                      )}
                    </span>
                    <span className="font-['Lato',sans-serif] text-[15px] leading-[22px] text-[#121212]">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleConfirmEndCall}
              data-testid="button-end-call-confirm"
              className="w-full h-[40px] rounded-[6px] bg-[#e6413c] text-white font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] border-none cursor-pointer hover:bg-[#d93a35] active:scale-[0.99] transition-all"
            >
              End call
            </button>
            <button
              type="button"
              onClick={() => setEndCallOpen(false)}
              data-testid="button-end-call-cancel"
              className="w-full h-[40px] mt-2 bg-transparent border-none cursor-pointer font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#066fac] hover:underline"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {sheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close participants"
            data-testid="overlay-participants"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-[rgba(0,0,0,0.18)] border-none p-0 m-0 cursor-pointer"
          />
          <div
            ref={sheetRef}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[12px] shadow-[0_-6px_16px_rgba(0,0,0,0.12)] flex flex-col"
            style={{ maxHeight: "78%" }}
            data-testid="sheet-participants"
            role="dialog"
            aria-modal="true"
            aria-label="Participants"
          >
            <div className="flex items-center px-4 pt-3 pb-2">
              <p className="font-['Lato',sans-serif] font-bold text-[15px] leading-[20px] text-[#121212]">
                Participants ({participants.length})
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pb-3">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-2"
                  data-testid={`row-participant-${p.id}`}
                >
                  <div
                    className="size-[36px] rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: p.avatarBg ?? "#3690cc" }}
                  >
                    {p.isUnknown ? (
                      <img src={assets.personSilhouette} alt="" className="size-[22px]" />
                    ) : (
                      <span className="font-['Lato',sans-serif] font-bold text-[12px] text-white select-none">
                        {p.initials}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-['Lato',sans-serif] font-bold text-[14px] leading-[20px] text-[#121212] truncate">
                      {p.name}
                    </span>
                    {p.subtitle && (
                      <span className="font-['Lato',sans-serif] text-[12px] leading-[16px] text-[#666666] truncate">
                        {p.subtitle}
                      </span>
                    )}
                  </div>
                  {!p.isCaller && (
                    <button
                      type="button"
                      onClick={() => handleRemove(p)}
                      data-testid={p.isSelf ? `button-leave-${p.id}` : `button-remove-${p.id}`}
                      className="shrink-0 size-[28px] rounded-full flex items-center justify-center border-none bg-transparent hover:bg-[#f3f3f3] active:bg-[#ececec] cursor-pointer transition-colors"
                      aria-label={p.isSelf ? "Leave call" : `Remove ${p.name}`}
                    >
                      <img src={assets.removeMember} alt="" className="size-[18px]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
