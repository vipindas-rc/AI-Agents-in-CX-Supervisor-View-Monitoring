import { useEffect, useRef, useState } from 'react';

import { RcIcon } from '@ringcentral/juno';
import { MonitorCall } from '@ringcentral/juno-icon';
import { CaretDownMd } from '@ringcentral/spring-icon';

import {
  getInsightChecklistSections,
  INSIGHT_NOTES,
  INSIGHT_NOTES_UPDATED_AT,
  transcriptTurnAt,
} from '../../../mock/supervisorMock';
import { getScoreSeverity } from '../DigitalInteractionTable/components/ScoreIndicator';
import { AiCheckAreaChecked, AiCheckAreaUnchecked } from './ChecklistIcons';
import { Tooltip } from '@ringcx/ui';

import {
  ActionButton,
  ActionIcon,
  ActionLabel,
  ActionSlot,
  Avatar,
  BargeBanner,
  ChecklistAnswers,
  ChecklistBody,
  ChecklistCheckIcon,
  ChecklistDisclaimer,
  ChecklistItem,
  ChecklistItemHead,
  ChecklistItemTitle,
  ChecklistRequiredTag,
  ChecklistSectionCaret,
  ChecklistSectionHeader,
  ChecklistSectionSubtitle,
  ChecklistSectionTitle,
  ChecklistSectionTitles,
  CloseButton,
  Content,
  ControlBar,
  ControlRow,
  EntryHead,
  EntryMain,
  EntryName,
  EntryText,
  EntryTime,
  InfoIcon,
  MetricLabel,
  MetricRow,
  Metrics,
  MetricValue,
  NoteHeading,
  NoteList,
  NotesBar,
  NotesBarText,
  NotesBody,
  Panel,
  PanelHeader,
  PanelOverlay,
  PanelTitle,
  SystemDivider,
  TabPill,
  Tabs,
  TranscriptBody,
  TranscriptEntry,
  TypingDots,
  UpdateLink,
} from './AiInsightsPanel.styled';

type InsightTab = 'notes' | 'transcript' | 'checklist';

// Severity colors mirror the interaction table's ScoreIndicator so the panel's
// Sentiment / Confidence read identically to the row they were opened from.
const SEVERITY_COLOR = {
  critical: '#d32f2f',
  warning: '#ed6c02',
  healthy: '#2e7d32',
  muted: '#9aa0a6',
};

// Avatar palette mirrors the Figma transcript entries (customer vs agent).
const CUSTOMER_AVATAR = '#fe8624';
const AGENT_AVATAR = '#066fac';

// Reveal one turn at a time, slowly enough that a supervisor can comfortably
// read each message before the next arrives.
const STREAM_INTERVAL_MS = 5000;
// Keep a bounded window of turns so a long-running live feed never grows without
// limit; older turns scroll out of view as the conversation keeps streaming.
const STREAM_WINDOW = 9;
// Start partway through the conversation so the panel opens onto an interaction
// that already looks live/in-progress (no "connected" line at the top). Must be
// greater than STREAM_WINDOW so the visible window never scrolls back to turn 0.
const STREAM_START = 13;

// Maps a row's sentiment score to the same severity bands the table uses, then
// to a human label + matching status-dot color.
function sentimentMetric(score: number | null | undefined): {
  value: string;
  color: string;
} {
  if (typeof score !== 'number') {
    return { value: '—', color: SEVERITY_COLOR.muted };
  }
  const sev = getScoreSeverity('sentiment', score);
  if (sev === 'critical') return { value: 'Negative', color: SEVERITY_COLOR.critical };
  if (sev === 'warning') return { value: 'Neutral', color: SEVERITY_COLOR.warning };
  return { value: 'Positive', color: SEVERITY_COLOR.healthy };
}

// Confidence is AI-only; human interactions have none (renders N/A).
function confidenceMetric(score: number | null | undefined): {
  value: string;
  color: string;
} {
  if (typeof score !== 'number') {
    return { value: 'N/A', color: SEVERITY_COLOR.muted };
  }
  const sev = getScoreSeverity('confidence', score);
  if (sev === 'critical') return { value: 'Low', color: SEVERITY_COLOR.critical };
  if (sev === 'warning') return { value: 'Medium', color: SEVERITY_COLOR.warning };
  return { value: 'High', color: SEVERITY_COLOR.healthy };
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Renders a deterministic clock time (09:35 PM, 09:36 PM, ...) per turn so the
// streamed transcript reads like the Figma timestamps without using live wall time.
function turnTime(index: number): string {
  const base = 21 * 60 + 35; // 09:35 PM
  const total = base + index;
  const hours24 = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

const InfoSvg = () => (
  <InfoIcon aria-hidden>
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='16' x2='12' y2='12' />
      <line x1='12' y1='8' x2='12.01' y2='8' />
    </svg>
  </InfoIcon>
);

const RefreshSvg = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 2v6h-6' />
    <path d='M3 12a9 9 0 0 1 15-6.7L21 8' />
    <path d='M3 22v-6h6' />
    <path d='M21 12a9 9 0 0 1-15 6.7L3 16' />
  </svg>
);

// Transfer glyph — exact vector from the Figma "Control" footer (node 21:67367).
const TransferGlyph = () => (
  <svg
    width='18'
    height='14'
    viewBox='0 0 17.3962 13.0175'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <path
      d='M12.1475 13.0175L11.0725 11.9694L13.8387 9.13312H0V7.63312H17.3962L12.1462 13.0169L12.1475 13.0175ZM12.1475 0L11.0725 1.04813L13.8387 3.88437H0V5.38437H17.3962L12.1462 0.000624955L12.1475 0Z'
      fill='currentColor'
    />
  </svg>
);

// Take-over glyph — exact vector from the Figma "Control" footer (node 21:67370).
const TakeOverGlyph = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 28 28'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <path
      d='M8.95901 14.2701L8.96389 14.2711C9.71471 14.546 10.2477 15.2244 10.3116 16.0299L10.3184 16.193L10.3155 16.318V16.3287C10.3156 17.0454 10.7637 17.6552 11.3916 17.8981L11.4073 17.9039L11.4229 17.9088L11.5489 17.9498L11.5635 17.9547L11.5782 17.9576C12.094 18.0911 12.8508 18.2555 13.6465 18.3131L13.9893 18.3307H14.003C14.9013 18.3353 15.7971 18.2419 16.6748 18.0533L16.6817 18.0524C17.2318 17.9266 17.6581 17.4834 17.7539 16.9235L17.7578 16.9039L17.7598 16.8844L17.7705 16.7682L17.7725 16.7496L17.7735 16.732L17.7813 16.4918C17.8088 15.6416 18.3474 14.9226 19.0996 14.6324L19.2666 14.5768L22.1699 13.7301L22.2412 14.0065L22.2578 14.0709L22.2901 14.1305C23.0943 15.6193 23.1958 17.0168 22.6797 18.2184L22.6651 18.2526C22.4606 18.7058 22.1838 19.124 21.8467 19.4899L21.5459 19.7965C21.1119 20.198 20.6233 20.5504 20.0948 20.8395L20.0713 20.8512L20.0498 20.8629C18.4769 21.7194 16.4589 22.1924 14.3252 22.193L13.8721 22.1861H13.8731C11.9117 22.1275 10.0855 21.6744 8.61331 20.9469C7.13638 20.217 6.05091 19.2294 5.50686 18.1236C5.03997 17.174 4.70542 15.6017 6.00686 13.5602L6.00589 13.5592L6.21389 13.235L8.95901 14.2701ZM16.877 7.65685L16.5948 7.93908L14.1494 5.49377V14.0123H13.7491V5.59826L12.8106 6.53673L11.4053 7.93908L11.1231 7.65685L14 4.77697L16.877 7.65685Z'
      stroke='currentColor'
      strokeWidth='1.1'
    />
  </svg>
);

interface AiInsightsPanelProps {
  agentName: string;
  isVoice: boolean;
  sentimentScore?: number | null;
  confidenceScore?: number | null;
  // True while the supervisor has taken over this interaction (the AI/agent
  // has moved on to its next conversation).
  isBarged?: boolean;
  // Label for the agent being taken over from — 'AI' for Air agents, 'agent'
  // for human agents — used in the active-takeover wording.
  takeoverSubject?: string;
  onTransfer?: () => void;
  onTakeOver?: () => void;
  onMonitor?: () => void;
  // Mirrors the table's hover Monitor icon gating: the button always renders
  // but is disabled (with an explanatory tooltip) when the interaction can't
  // be monitored — e.g. a digital conversation handled by a human agent.
  monitorDisabled?: boolean;
  monitorDisabledTooltip?: string;
  // True while a monitoring session is active for this interaction; clicking
  // Monitor again stops it (same toggle semantics as the table icon).
  isMonitoring?: boolean;
  // True when the interaction is handled by an AirPro (AI) agent. Human-speech
  // metrics (Speech Pace, Talk Ratio) don't apply to AI agents and are hidden.
  isAiAgent?: boolean;
  onClose: () => void;
}

const AiInsightsPanel = ({
  agentName,
  isVoice,
  sentimentScore,
  confidenceScore,
  isBarged = false,
  takeoverSubject = 'AI',
  onTransfer,
  onTakeOver,
  onMonitor,
  monitorDisabled = false,
  monitorDisabledTooltip,
  isMonitoring = false,
  isAiAgent = false,
  onClose,
}: AiInsightsPanelProps) => {
  const [tab, setTab] = useState<InsightTab>('notes');
  const [updating, setUpdating] = useState(false);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

  // Low-confidence interactions stream the negative / escalating conversation so
  // the transcript content matches the row's low confidence and sinking sentiment.
  const tone: 'positive' | 'negative' =
    typeof confidenceScore === 'number' &&
    getScoreSeverity('confidence', confidenceScore) === 'critical'
      ? 'negative'
      : 'positive';

  // Live (mock) streaming: an ever-growing index that keeps revealing turns so
  // the transcript stays "live" for as long as the panel is open. It begins at
  // STREAM_START so the panel opens mid-conversation (looks already in progress);
  // later turns cycle the same conversation.
  const [count, setCount] = useState(STREAM_START);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restart the stream whenever the opened interaction's identity changes.
  useEffect(() => {
    setCount(STREAM_START);
  }, [isVoice, agentName]);

  useEffect(() => {
    const id = window.setInterval(
      () => setCount((c) => c + 1),
      STREAM_INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [isVoice, agentName]);

  // Auto-scroll the transcript to the newest turn as it streams in.
  useEffect(() => {
    if (tab !== 'transcript') return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count, tab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleUpdateNotes = () => {
    setUpdating(true);
    window.setTimeout(() => setUpdating(false), 1100);
  };

  // Speech Pace and Talk Ratio describe a human speaker's delivery and
  // conversational balance — they're meaningless for an AI agent, so they're
  // shown only for human-handled interactions.
  const metrics = [
    { label: 'Sentiment', ...sentimentMetric(sentimentScore) },
    { label: 'Confidence', ...confidenceMetric(confidenceScore) },
    ...(isAiAgent
      ? []
      : [
          { label: 'Speech Pace', value: '135 WPM', color: SEVERITY_COLOR.healthy },
          { label: 'Talk Ratio', value: '49%', color: SEVERITY_COLOR.critical },
        ]),
  ];

  // The bounded window of currently-visible turns plus the speaker now "typing".
  const start = Math.max(0, count - STREAM_WINDOW);
  const visibleIndexes: number[] = [];
  for (let i = start; i < count; i += 1) visibleIndexes.push(i);
  const nextSpeaker = transcriptTurnAt(count, { isVoice, agentName, tone });

  return (
    <PanelOverlay onClick={onClose} data-testid='overlay-ai-insights'>
      <Panel
        role='complementary'
        aria-label='AI Insights'
        onClick={(e) => e.stopPropagation()}
        data-testid='panel-ai-insights'
      >
        <PanelHeader>
          <PanelTitle data-testid='text-ai-insights-title'>AI Insights</PanelTitle>
          <CloseButton onClick={onClose} aria-label='Close' data-testid='button-close-ai-insights'>
            ✕
          </CloseButton>
        </PanelHeader>

        <Metrics>
          {metrics.map((metric) => (
            <MetricRow
              key={metric.label}
              data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <MetricLabel>
                {metric.label}
                <InfoSvg />
              </MetricLabel>
              <MetricValue $color={metric.color}>{metric.value}</MetricValue>
            </MetricRow>
          ))}
        </Metrics>

        <Tabs role='tablist'>
          <TabPill
            role='tab'
            $active={tab === 'notes'}
            onClick={() => setTab('notes')}
            data-testid='tab-notes'
          >
            Notes
          </TabPill>
          <TabPill
            role='tab'
            $active={tab === 'transcript'}
            onClick={() => setTab('transcript')}
            data-testid='tab-transcript'
          >
            Transcript
          </TabPill>
          <TabPill
            role='tab'
            $active={tab === 'checklist'}
            onClick={() => setTab('checklist')}
            data-testid='tab-checklist'
          >
            Checklist
          </TabPill>
        </Tabs>

        <Content ref={scrollRef}>
          {tab === 'notes' && (
            <>
              <NotesBar>
                <NotesBarText data-testid='text-notes-updated'>
                  Last updated at {INSIGHT_NOTES_UPDATED_AT}
                </NotesBarText>
                <UpdateLink
                  onClick={handleUpdateNotes}
                  data-spinning={updating}
                  data-testid='button-update-notes'
                >
                  <span className='spin'>
                    <RefreshSvg />
                  </span>
                  Update notes
                </UpdateLink>
              </NotesBar>
              <NotesBody>
                {INSIGHT_NOTES.map((section) => (
                  <div key={section.heading}>
                    <NoteHeading>{section.heading}</NoteHeading>
                    <NoteList>
                      {section.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </NoteList>
                  </div>
                ))}
              </NotesBody>
            </>
          )}

          {tab === 'transcript' && (
            <TranscriptBody data-testid='body-transcript'>
              {visibleIndexes.map((absIndex) => {
                const turn = transcriptTurnAt(absIndex, { isVoice, agentName, tone });
                if (turn.type === 'SYSTEM') {
                  return (
                    <SystemDivider key={`sys-${absIndex}`} data-testid='divider-system'>
                      {turn.message}
                    </SystemDivider>
                  );
                }
                const isClient = turn.type === 'CLIENT';
                const name = turn.name ?? (isClient ? 'Customer' : 'Agent');
                return (
                  <TranscriptEntry key={absIndex} data-testid={`transcript-turn-${absIndex}`}>
                    <Avatar $color={isClient ? CUSTOMER_AVATAR : AGENT_AVATAR}>
                      {initialsOf(name)}
                    </Avatar>
                    <EntryMain>
                      <EntryHead>
                        <EntryName>{name}</EntryName>
                        <EntryTime>{turnTime(absIndex)}</EntryTime>
                      </EntryHead>
                      <EntryText>{turn.message}</EntryText>
                    </EntryMain>
                  </TranscriptEntry>
                );
              })}
              <TranscriptEntry data-testid='transcript-typing'>
                <Avatar
                  $color={nextSpeaker.type === 'CLIENT' ? CUSTOMER_AVATAR : AGENT_AVATAR}
                >
                  {initialsOf(nextSpeaker.name ?? '?')}
                </Avatar>
                <EntryMain>
                  <EntryHead>
                    <EntryName>{nextSpeaker.name}</EntryName>
                  </EntryHead>
                  <TypingDots aria-label='typing'>
                    <span />
                    <span />
                    <span />
                  </TypingDots>
                </EntryMain>
              </TranscriptEntry>
            </TranscriptBody>
          )}

          {tab === 'checklist' && (
            <ChecklistBody data-testid='body-checklist'>
              {getInsightChecklistSections(tone).map((section, sectionIndex) => {
                const isOpen = openSections[sectionIndex] ?? false;
                const requiredCount = section.items.filter((item) => item.required).length;
                return (
                  <div key={section.heading} data-testid={`checklist-section-${sectionIndex}`}>
                    <ChecklistSectionHeader
                      type='button'
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [sectionIndex]: !isOpen,
                        }))
                      }
                      aria-expanded={isOpen}
                      data-testid={`checklist-section-toggle-${sectionIndex}`}
                    >
                      <ChecklistSectionTitles>
                        <ChecklistSectionTitle>{section.heading}</ChecklistSectionTitle>
                        <ChecklistSectionSubtitle>
                          {requiredCount} required
                        </ChecklistSectionSubtitle>
                      </ChecklistSectionTitles>
                      <ChecklistSectionCaret $open={isOpen}>
                        <CaretDownMd width={16} height={16} fill='currentColor' />
                      </ChecklistSectionCaret>
                    </ChecklistSectionHeader>

                    {isOpen &&
                      section.items.map((item, itemIndex) => (
                        <ChecklistItem
                          key={item.title}
                          data-testid={`checklist-item-${sectionIndex}-${itemIndex}`}
                        >
                          <ChecklistItemHead>
                            <ChecklistCheckIcon>
                              {item.done ? <AiCheckAreaChecked /> : <AiCheckAreaUnchecked />}
                            </ChecklistCheckIcon>
                            <ChecklistItemTitle $done={item.done}>
                              {item.title}
                            </ChecklistItemTitle>
                            {item.required && (
                              <ChecklistRequiredTag>Required</ChecklistRequiredTag>
                            )}
                          </ChecklistItemHead>
                          {item.answers.length > 0 && (
                            <ChecklistAnswers>
                              {item.answers.map((answer) => (
                                <li key={answer}>{answer}</li>
                              ))}
                            </ChecklistAnswers>
                          )}
                        </ChecklistItem>
                      ))}
                  </div>
                );
              })}
            </ChecklistBody>
          )}
        </Content>

        {tab === 'checklist' && (
          <ChecklistDisclaimer data-testid='footer-checklist-disclaimer'>
            AI outputs should not be the sole or primary basis for employment decisions.
          </ChecklistDisclaimer>
        )}

        {isBarged && (
          <BargeBanner data-testid='banner-takeover-active'>
            You've taken over this conversation. {agentName} ({takeoverSubject})
            has moved on to the next one.
          </BargeBanner>
        )}

        <ControlBar>
          <ControlRow>
            {onMonitor &&
              (() => {
                const monitorButton = (
                  <ActionButton
                    type='button'
                    $active={isMonitoring}
                    disabled={monitorDisabled}
                    onClick={monitorDisabled ? undefined : onMonitor}
                    data-testid='button-monitor'
                  >
                    <ActionIcon $active={isMonitoring}>
                      <RcIcon symbol={MonitorCall} size='small' />
                    </ActionIcon>
                    <ActionLabel>
                      {isMonitoring ? 'Monitoring' : 'Monitor'}
                    </ActionLabel>
                  </ActionButton>
                );
                // Disabled buttons don't fire hover events, so the tooltip
                // wraps a span — same pattern as the table's Monitor icon.
                return monitorDisabled && monitorDisabledTooltip ? (
                  <Tooltip title={monitorDisabledTooltip} placement='top'>
                    <ActionSlot>{monitorButton}</ActionSlot>
                  </Tooltip>
                ) : (
                  monitorButton
                );
              })()}
            <ActionButton
              type='button'
              onClick={onTransfer}
              data-testid='button-transfer'
            >
              <ActionIcon>
                <TransferGlyph />
              </ActionIcon>
              <ActionLabel>Transfer</ActionLabel>
            </ActionButton>
            <ActionButton
              type='button'
              $active={isBarged}
              disabled={isBarged}
              onClick={isBarged ? undefined : onTakeOver}
              data-testid='button-take-over'
            >
              <ActionIcon $active={isBarged}>
                <TakeOverGlyph />
              </ActionIcon>
              <ActionLabel>{isBarged ? 'Taken over' : 'Take over'}</ActionLabel>
            </ActionButton>
          </ControlRow>
        </ControlBar>
      </Panel>
    </PanelOverlay>
  );
};

export default AiInsightsPanel;
