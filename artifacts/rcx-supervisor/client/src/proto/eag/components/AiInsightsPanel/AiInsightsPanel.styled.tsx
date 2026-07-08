import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
`;

const blink = keyframes`
    0%, 80%, 100% { opacity: 0.25; }
    40% { opacity: 1; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// Right-docked side panel that slides in from the table's right edge. It is
// scoped to the interaction table area (an absolutely-positioned overlay inside
// the table's relative container), so its height matches the table and it never
// covers the page chrome above it. Matches the Figma "insights panel" frame
// (420px wide, left divider + soft shadow).
export const PanelOverlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 30;
`;

export const Panel = styled.aside`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 420px;
    max-width: 100%;
    background: #ffffff;
    border-left: 1px solid #e0e0e0;
    box-shadow: -8px 0 28px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    z-index: 10001;
    animation: ${slideIn} 0.22s ease-out;
    font-family:
        Lato,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        sans-serif;
    color: #212121;
`;

export const PanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
`;

export const PanelTitle = styled.h2`
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #212121;
`;

export const CloseButton = styled.button`
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #5f6368;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-size: 18px;
    line-height: 1;

    &:hover {
        background: #f1f3f4;
    }
`;

export const Metrics = styled.div`
    padding: 4px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const MetricRow = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
`;

export const MetricLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 160px;
    color: #5f6368;
`;

export const MetricValue = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: #212121;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${({ $color }) => $color};
    }
`;

export const InfoIcon = styled.span`
    display: inline-flex;
    color: #9aa0a6;
`;

export const Tabs = styled.div`
    display: flex;
    gap: 10px;
    padding: 12px 16px 16px;
`;

export const TabPill = styled.button<{ $active: boolean }>`
    appearance: none;
    cursor: pointer;
    padding: 6px 18px;
    font-size: 14px;
    border-radius: 16px;
    border: 1px solid ${({ $active }) => ($active ? '#c1c3c8' : '#d1d1d1')};
    background: ${({ $active }) => ($active ? '#ebebed' : '#ffffff')};
    color: #212121;
    font-weight: ${({ $active }) => ($active ? 700 : 400)};

    &:hover {
        background: ${({ $active }) => ($active ? '#ebebed' : '#f7f7f7')};
    }
`;

export const Content = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
`;

export const NotesBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 8px 16px;
    background: #f5f6f7;
    box-shadow: inset 0 1px 0 #eceff1;
    font-size: 13px;
`;

export const NotesBarText = styled.span`
    color: #80868b;
`;

export const UpdateLink = styled.button`
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #066fac;
    font-size: 13px;
    font-weight: 500;
    padding: 0;

    .spin {
        display: inline-flex;
    }
    &[data-spinning='true'] .spin {
        animation: ${spin} 0.8s linear infinite;
    }
`;

export const NotesBody = styled.div`
    padding: 16px;
`;

export const NoteHeading = styled.h3`
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
    color: #212121;
`;

export const NoteList = styled.ul`
    margin: 0 0 18px;
    padding-left: 20px;
    color: #3c4043;
    font-size: 14px;
    line-height: 1.5;

    li {
        margin-bottom: 4px;
    }
`;

export const TranscriptBody = styled.div`
    padding: 8px 16px 16px;
`;

export const SystemDivider = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: #9aa0a6;
    font-size: 13px;
    margin: 12px 0 18px;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e8eaed;
    }
`;

export const TranscriptEntry = styled.div`
    display: flex;
    gap: 12px;
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid #eceff1;

    &:last-child {
        border-bottom: none;
    }
`;

export const Avatar = styled.div<{ $color: string }>`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const EntryMain = styled.div`
    flex: 1;
    min-width: 0;
`;

export const EntryHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
`;

export const EntryName = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: #212121;
`;

export const EntryTime = styled.span`
    font-size: 13px;
    color: #80868b;
    flex-shrink: 0;
    margin-left: 8px;
`;

export const EntryText = styled.div`
    font-size: 14px;
    line-height: 1.5;
    color: #3c4043;
    white-space: pre-wrap;
`;

export const TypingDots = styled.div`
    display: inline-flex;
    gap: 4px;
    padding: 2px 0;

    span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9aa0a6;
        animation: ${blink} 1.2s infinite ease-in-out both;
    }
    span:nth-child(2) {
        animation-delay: 0.2s;
    }
    span:nth-child(3) {
        animation-delay: 0.4s;
    }
`;

export const ChecklistBody = styled.div`
    display: flex;
    flex-direction: column;
`;

// Section header row — collapsible, light-gray band with hairline top/bottom
// borders (Figma "LHeader").
export const ChecklistSectionHeader = styled.button`
    appearance: none;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background: #f5f6f9;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 16px;
    text-align: left;
`;

export const ChecklistSectionTitles = styled.span`
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const ChecklistSectionTitle = styled.span`
    font-size: 15px;
    font-weight: 700;
    line-height: 20px;
    color: #000000;
`;

export const ChecklistSectionSubtitle = styled.span`
    font-size: 12px;
    line-height: 17px;
    color: #72757a;
`;

export const ChecklistSectionCaret = styled.span<{ $open: boolean }>`
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: inline-flex;
    color: #000000;
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
    transition: transform 150ms ease;
`;

export const ChecklistItem = styled.div`
    padding: 20px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    &:last-child {
        border-bottom: none;
    }
`;

export const ChecklistItemHead = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
`;

export const ChecklistCheckIcon = styled.span`
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    display: inline-flex;
`;

export const ChecklistItemTitle = styled.span<{ $done: boolean }>`
    flex: 1 0 0;
    min-width: 0;
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    ${({ $done }) =>
        $done
            ? `
        color: #9e9fa4;
        text-decoration: line-through;
    `
            : `
        color: #000000;
    `}
`;

export const ChecklistRequiredTag = styled.span`
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 16px;
    padding: 0 4px;
    border-radius: 4px;
    background: #72757a;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    line-height: 17px;
    white-space: nowrap;
`;

export const ChecklistAnswers = styled.ul`
    margin: 10px 0 0;
    padding-left: 20px;
    list-style: disc;
    color: #323439;
    font-size: 14px;
    line-height: 20px;

    li {
        margin-bottom: 8px;
        padding-left: 2px;
    }
    li:last-child {
        margin-bottom: 0;
    }
`;

export const ChecklistDisclaimer = styled.div`
    flex-shrink: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 12px 16px;
    font-size: 10px;
    line-height: 14px;
    color: #72757a;
    text-align: center;
`;

export const Footer = styled.div`
    border-top: 1px solid #e8eaed;
    padding: 12px 16px;
    font-size: 12px;
    color: #9aa0a6;
`;

const bargePulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.45); opacity: 0.55; }
`;

// Status banner shown while the supervisor has taken over. Not part
// of the static Figma footer; styled to read as an active-takeover signal.
export const BargeBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #e8f1f8;
    border-top: 1px solid #cfe3f1;
    border-bottom: 1px solid #cfe3f1;
    color: #055a8c;
    font-size: 13px;
    font-weight: 600;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #066fac;
        flex-shrink: 0;
        animation: ${bargePulse} 1.4s ease-in-out infinite;
    }
`;

// --- Static control footer (Figma "Control" node 21:67363) -------------------
// A white bar with a soft drop shadow holding two equal-width action cards
// (Transfer / Take over). Lives outside the scrolling tab Content so it stays
// pinned across every panel tab.
export const ControlBar = styled.div`
    flex-shrink: 0;
    background: #ffffff;
    filter: drop-shadow(0px 0px 2px #dddfe5);
    padding: 20px 16px;
`;

export const ControlRow = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
`;

export const ActionButton = styled.button<{ $active?: boolean }>`
    appearance: none;
    flex: 1 0 0;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    cursor: pointer;
    border-radius: 8px;
    background: ${({ $active }) => ($active ? '#e8f1f8' : '#ffffff')};
    border: 1px solid
        ${({ $active }) => ($active ? '#066fac' : 'rgba(0, 0, 0, 0.1)')};
    transition:
        background 120ms ease,
        border-color 120ms ease,
        box-shadow 120ms ease,
        transform 80ms ease;

    &:hover {
        background: ${({ $active }) => ($active ? '#dae9f4' : '#f5f6f7')};
        border-color: ${({ $active }) =>
            $active ? '#055a8c' : 'rgba(0, 0, 0, 0.22)'};
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(0.5px);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    &:focus-visible {
        outline: 2px solid #066fac;
        outline-offset: 2px;
    }

    &:disabled {
        cursor: default;
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.06);
        box-shadow: none;
        transform: none;
    }
`;

/* Layout wrapper so a disabled action button can sit inside a Tooltip span
   without breaking the equal-width control row. */
export const ActionSlot = styled.span`
    flex: 1 0 0;
    min-width: 0;
    display: flex;

    & > ${ActionButton} {
        flex: 1 0 0;
    }
`;

export const ActionIcon = styled.span<{ $active?: boolean }>`
    width: 36px;
    height: 36px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $active }) => ($active ? '#066fac' : '#dddfe5')};
    color: ${({ $active }) => ($active ? '#ffffff' : '#323439')};
    transition:
        background 120ms ease,
        color 120ms ease;

    ${ActionButton}:hover & {
        background: ${({ $active }) => ($active ? '#055a8c' : '#cdd0d8')};
    }

    ${ActionButton}:disabled & {
        background: #eef0f3;
        color: #9e9fa4;
    }
`;

export const ActionLabel = styled.span`
    font-size: 12px;
    font-weight: 500;
    line-height: 17px;
    letter-spacing: 0;
    color: #323439;
    text-align: center;
    white-space: nowrap;

    ${ActionButton}:disabled & {
        color: #9e9fa4;
    }
`;
