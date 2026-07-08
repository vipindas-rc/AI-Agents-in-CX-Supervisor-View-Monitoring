import type { FC } from 'react';

import { Tooltip } from '@ringcx/ui';

import {
    CONFIDENCE_INDICATOR,
    SENTIMENT_INDICATOR,
} from '../../../constants/testIds';

export type ScoreKind = 'confidence' | 'sentiment';
export type ScoreSeverity = 'critical' | 'warning' | null;

// Two-tier alert thresholds. Below `critical` the interaction is in the red
// (urgent intervention); between `critical` and `warning` it's a lighter-orange
// heads-up. At or above `warning` the score is healthy.
export const SCORE_THRESHOLDS: Record<
    ScoreKind,
    { critical: number; warning: number }
> = {
    confidence: { critical: 25, warning: 40 },
    sentiment: { critical: 25, warning: 40 },
};

const COLORS = {
    critical: '#d32f2f',
    warning: '#ed6c02',
    healthy: '#2e7d32',
    text: '#212121',
};

export const getScoreSeverity = (
    kind: ScoreKind,
    score: number | null | undefined
): ScoreSeverity => {
    if (typeof score !== 'number') return null;
    const { critical, warning } = SCORE_THRESHOLDS[kind];
    if (score < critical) return 'critical';
    if (score < warning) return 'warning';
    return null;
};

// Combines two severities and returns the more urgent of the two (critical wins
// over warning wins over none) so a row's alert treatment reflects its worst
// signal.
export const worstSeverity = (
    a: ScoreSeverity,
    b: ScoreSeverity
): ScoreSeverity => {
    if (a === 'critical' || b === 'critical') return 'critical';
    if (a === 'warning' || b === 'warning') return 'warning';
    return null;
};

const colorForSeverity = (severity: ScoreSeverity): string => {
    if (severity === 'critical') return COLORS.critical;
    if (severity === 'warning') return COLORS.warning;
    return COLORS.healthy;
};

const tooltipFor = (kind: ScoreKind, severity: ScoreSeverity): string => {
    const label = kind === 'confidence' ? 'confidence' : 'sentiment';
    const level =
        severity === 'critical'
            ? 'Low'
            : severity === 'warning'
              ? 'Medium'
              : 'High';
    return `${level} ${label}`;
};

const AlertTriangle: FC<{ color: string; title?: string }> = ({
    color,
    title,
}) => (
    <svg
        width='12'
        height='12'
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        role='img'
        style={{ flexShrink: 0 }}
    >
        {title ? <title>{title}</title> : null}
        <path d='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
        <line x1='12' y1='9' x2='12' y2='13' />
        <line x1='12' y1='17' x2='12.01' y2='17' />
    </svg>
);

// Low-impact quality signal: a small colored dot + numeric value with a hover
// tooltip. Critical scores also show an alert triangle. Human-handled
// interactions have no confidence score, so that cell renders an em-dash.
export const ScoreIndicator: FC<{
    kind: ScoreKind;
    score: number | null | undefined;
}> = ({ kind, score }) => {
    const testId =
        kind === 'confidence' ? CONFIDENCE_INDICATOR : SENTIMENT_INDICATOR;

    if (typeof score !== 'number') {
        return (
            <span data-aid={testId} data-testid={testId} role='gridcell'>
                —
            </span>
        );
    }

    const severity = getScoreSeverity(kind, score);
    const color = colorForSeverity(severity);
    const tip = tooltipFor(kind, severity);

    return (
        <Tooltip arrow title={tip}>
            <span
                data-aid={testId}
                data-testid={testId}
                data-severity={severity ?? 'healthy'}
                role='gridcell'
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    lineHeight: 1,
                    cursor: 'default',
                }}
            >
                <span
                    aria-hidden='true'
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: color,
                        flexShrink: 0,
                        transition: 'background-color 0.4s ease',
                    }}
                />
                <span
                    style={{
                        color: severity ? color : COLORS.text,
                        fontWeight: severity ? 600 : 400,
                        // tabular figures keep the value a fixed width as it ticks
                        // so the dot/triangle never shift as digits change.
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'color 0.4s ease',
                    }}
                >
                    {score}
                </span>
                {severity === 'critical' ? (
                    <AlertTriangle color={COLORS.critical} />
                ) : null}
            </span>
        </Tooltip>
    );
};
