import { Fragment } from 'react';

import {
    AgentMd,
    VerticalBars1Md,
    VerticalBars2Md,
    VerticalBars3Md,
    CircleCheckFilledSm,
} from '@ringcentral/spring-icon';
import { Tooltip, ListItemText, ListItem, Icon } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import {
    MetricsWrapper,
    WaitTimeWrapper,
    WaitTimeContent,
    AgentCountWrapper,
    StyledIcon,
    SelectedIconWrapper,
    AgentCountDescriptor,
} from './QueueItem.styled';
import {
    REQUEUE_QUEUE_ITEM,
    REQUEUE_SHORTCUT_ITEM,
    REQUEUE_QUEUE_METRICS,
    REQUEUE_WAIT_TIME_INDICATOR,
    REQUEUE_AGENT_COUNT,
    REQUEUE_QUEUE_IMMEDIATE_ICON,
    REQUEUE_QUEUE_WARN_ICON,
    REQUEUE_QUEUE_BUSY_ICON,
    REQUEUE_QUEUE_NO_AGENT_ICON,
} from '../../../constants/testIds';
import { WAIT_TIME_THRESHOLDS } from '../constants';
import type {
    QueueItemProps,
    QueueMetrics,
    RequeueShortcut,
    RequeueQueue,
} from '../types';

const getItemName = (
    queue: QueueItemProps['queue'],
    isAdvanced: boolean
): string => {
    if (isAdvanced) {
        return (queue as RequeueQueue).gateName;
    }
    return (queue as RequeueShortcut).name;
};

const getWaitTimeFlags = (metrics: QueueMetrics) => {
    const {
        longestWaitingTimeInSeconds,
        numberOfAgentsAvailable,
        numberOfAgentsLoggedIn,
    } = metrics;

    const hasNoAgents = numberOfAgentsLoggedIn === 0;
    const hasNoWaitTime = longestWaitingTimeInSeconds <= 0;
    const hasAvailableAgents = numberOfAgentsAvailable > 0;
    const isMediumWaitTime =
        longestWaitingTimeInSeconds > 0 &&
        longestWaitingTimeInSeconds <= WAIT_TIME_THRESHOLDS.MEDIUM;
    const isLongWaitTime =
        longestWaitingTimeInSeconds > WAIT_TIME_THRESHOLDS.LONG;

    return {
        longestWaitingTimeInSeconds,
        numberOfAgentsAvailable,
        numberOfAgentsLoggedIn,
        hasNoAgents,
        hasNoWaitTime,
        hasAvailableAgents,
        isMediumWaitTime,
        isLongWaitTime,
    };
};

const formatWaitTimeLabel = (
    metrics: QueueMetrics,
    t: (key: string, options?: Record<string, unknown>) => string
): string => {
    const {
        longestWaitingTimeInSeconds,
        hasNoAgents,
        hasNoWaitTime,
        hasAvailableAgents,
        isLongWaitTime,
    } = getWaitTimeFlags(metrics);

    if (hasNoAgents) {
        return t('SOFTPHONE.REQUEUE.NO_AGENT');
    }

    if (hasNoWaitTime) {
        if (!hasAvailableAgents) {
            return t('SOFTPHONE.REQUEUE.FIRST_IN_LINE');
        }
        return t('SOFTPHONE.REQUEUE.READY');
    }

    if (isLongWaitTime) {
        return t('SOFTPHONE.REQUEUE.MORE_THAN_ONE_HOUR');
    }

    const minutes = Math.floor(longestWaitingTimeInSeconds / 60);
    const seconds = longestWaitingTimeInSeconds % 60;
    let timeLabel = '';
    if (minutes > 0) {
        timeLabel = t('SOFTPHONE.REQUEUE.MINS', { count: minutes }) + ' ';
    }
    if (seconds > 0) {
        timeLabel += t('SOFTPHONE.REQUEUE.SECONDS', { count: seconds });
    }
    return timeLabel.trim();
};

const getWaitTimeTooltip = (
    metrics: QueueMetrics,
    t: (key: string) => string
): string => {
    const { hasNoAgents, hasNoWaitTime, hasAvailableAgents } =
        getWaitTimeFlags(metrics);

    if (hasNoAgents) {
        return t('SOFTPHONE.REQUEUE.NO_AGENT_TOOLTIP');
    }
    if (!hasNoWaitTime) {
        return t('SOFTPHONE.REQUEUE.LONGEST_WAIT_TIME');
    }
    if (!hasAvailableAgents) {
        return t('SOFTPHONE.REQUEUE.FIRST_IN_LINE_TOOLTIP');
    }
    return t('SOFTPHONE.REQUEUE.IMMEDIATE_HANDLE_TOOLTIP');
};

const getWaitTimeIcon = (metrics: QueueMetrics) => {
    const { hasNoAgents, hasNoWaitTime, hasAvailableAgents, isMediumWaitTime } =
        getWaitTimeFlags(metrics);

    if (hasNoAgents) {
        return {
            symbol: VerticalBars3Md,
            className: 'text-neutral-b4',
            dataAid: REQUEUE_QUEUE_NO_AGENT_ICON,
            useStyledIcon: true,
        };
    }

    if (hasNoWaitTime && hasAvailableAgents) {
        return {
            symbol: VerticalBars1Md,
            className: 'text-success',
            dataAid: REQUEUE_QUEUE_IMMEDIATE_ICON,
            useStyledIcon: true,
        };
    }

    if (hasNoWaitTime || isMediumWaitTime) {
        return {
            symbol: VerticalBars2Md,
            className: 'text-warning',
            dataAid: REQUEUE_QUEUE_WARN_ICON,
            useStyledIcon: true,
        };
    }

    return {
        symbol: VerticalBars3Md,
        className: 'text-danger',
        dataAid: REQUEUE_QUEUE_BUSY_ICON,
        useStyledIcon: false,
    };
};

const getMetricsWithDefaults = (
    metrics: QueueMetrics | undefined,
    gateId: string
): QueueMetrics => {
    const {
        longestWaitingTimeInSeconds = 0,
        numberOfAgentsAvailable = 0,
        numberOfAgentsLoggedIn = 0,
        isQueueOpen = false,
        queueId = Number(gateId),
    } = metrics ?? {};

    return {
        queueId,
        longestWaitingTimeInSeconds,
        numberOfAgentsAvailable,
        numberOfAgentsLoggedIn,
        isQueueOpen,
    };
};

export const QueueItem = ({
    queue,
    metrics,
    isSelected,
    onClick,
    metricsLoaded,
    isAdvanced = true,
}: QueueItemProps) => {
    const { t } = useTranslation();

    const itemName = getItemName(queue, isAdvanced);

    const normalizedMetrics = getMetricsWithDefaults(metrics, queue.gateId);

    const waitTimeData = {
        label: formatWaitTimeLabel(normalizedMetrics, t),
        tooltip: getWaitTimeTooltip(normalizedMetrics, t),
        icon: getWaitTimeIcon(normalizedMetrics),
    };

    const availableAgentsLabel = t('SOFTPHONE.REQUEUE.AVAILABLE_AGENTS', {
        availableAgents: normalizedMetrics.numberOfAgentsAvailable,
    });
    const loggedAgentsLabel = t('SOFTPHONE.REQUEUE.LOGGED_AGENTS', {
        loggedAgents: normalizedMetrics.numberOfAgentsLoggedIn,
    });
    const agentCountTooltip = `${availableAgentsLabel}\n${loggedAgentsLabel}`;
    const agentCountTooltipTitle = (
        <Fragment>
            {availableAgentsLabel}
            <br />
            {loggedAgentsLabel}
        </Fragment>
    );

    const getListItemAriaLabel = () => {
        const itemType = isAdvanced
            ? t('SOFTPHONE.REQUEUE.QUEUE')
            : t('SOFTPHONE.REQUEUE.SHORTCUT');
        const waitTimeInfo = waitTimeData.label;
        const agentDescription = `${availableAgentsLabel}, ${loggedAgentsLabel}`;

        return `${itemName}, ${itemType}${isSelected ? ', selected' : ''}, ${waitTimeInfo}, ${agentDescription}`;
    };

    const WaitTimeIcon = waitTimeData.icon.useStyledIcon ? StyledIcon : Icon;
    const metricsContent = (
        <MetricsWrapper data-aid={REQUEUE_QUEUE_METRICS}>
            {waitTimeData && (
                <WaitTimeWrapper data-aid={REQUEUE_WAIT_TIME_INDICATOR}>
                    <Tooltip
                        size='medium'
                        placement='bottom-start'
                        className='z-[5261]'
                        title={waitTimeData.tooltip}
                        classes={{
                            paperContent: 'max-w-77',
                            content: 'text-sm',
                        }}
                    >
                        <WaitTimeContent>
                            <WaitTimeIcon
                                data-aid={waitTimeData.icon.dataAid}
                                symbol={waitTimeData.icon.symbol}
                                size='small'
                                className={waitTimeData.icon.className}
                                aria-hidden='true'
                            />
                            <span
                                className='text-right text-xs font-normal leading-4'
                                aria-label={waitTimeData.tooltip}
                            >
                                {waitTimeData.label}
                            </span>
                        </WaitTimeContent>
                    </Tooltip>
                </WaitTimeWrapper>
            )}

            <AgentCountWrapper data-aid={REQUEUE_AGENT_COUNT}>
                <Tooltip
                    size='medium'
                    className='typography-descriptorMini z-[5261]'
                    classes={{
                        content: 'text-sm',
                    }}
                    title={agentCountTooltipTitle}
                >
                    <AgentCountDescriptor className='typography-descriptor'>
                        <Icon
                            symbol={AgentMd}
                            size='small'
                            className='text-neutral-b2'
                            aria-hidden='true'
                        />
                        <span
                            className='truncate text-sm leading-4'
                            aria-label={agentCountTooltip}
                        >
                            {`${normalizedMetrics.numberOfAgentsAvailable}/${normalizedMetrics.numberOfAgentsLoggedIn}`}
                        </span>
                    </AgentCountDescriptor>
                </Tooltip>
            </AgentCountWrapper>
        </MetricsWrapper>
    );

    return (
        <ListItem
            clickable
            hoverable
            divider={true}
            onClick={onClick}
            size='auto'
            role='listitem'
            aria-label={getListItemAriaLabel()}
            tabIndex={0}
            data-aid={isAdvanced ? REQUEUE_QUEUE_ITEM : REQUEUE_SHORTCUT_ITEM}
            classes={{
                content: `flex flex-row p-4 ${isSelected ? 'bg-primary-t10' : ''}`,
                container: 'rounded-none',
                divider: 'm-0',
                root: 'p-0',
            }}
        >
            <ListItemText
                variant='primary'
                primary={<span title={itemName}>{itemName}</span>}
                secondary={metricsLoaded && metricsContent}
                classes={{
                    primaryText: 'text-base font-normal text-neutral-f06',
                    secondaryText: 'typography-descriptor mt-1',
                }}
            />
            {isSelected && (
                <SelectedIconWrapper
                    symbol={CircleCheckFilledSm}
                    size='medium'
                    aria-hidden='true'
                />
            )}
        </ListItem>
    );
};
