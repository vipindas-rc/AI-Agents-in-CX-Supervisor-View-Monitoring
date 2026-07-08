import { useState, useRef, useEffect } from 'react';

import { NotesMd, AiStarsMd } from '@ringcentral/spring-icon';
import { Text, Divider } from '@ringcentral/spring-ui';
import clsx from 'clsx';

import { HistoryIcon } from './HistoryIcon';
import type { ActivityLog } from '../../../../common/services/transport';
import {
    CONTACT_MANAGEMENT_HISTORY_AGENT_NOTE,
    CONTACT_MANAGEMENT_HISTORY_AI_SUMMARY,
    CONTACT_MANAGEMENT_HISTORY_DISPOSITION,
    CONTACT_MANAGEMENT_HISTORY_DURATION,
    CONTACT_MANAGEMENT_HISTORY_ITEM,
    CONTACT_MANAGEMENT_HISTORY_TIME,
} from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import translate from '../../../../helpers/translate';
import { type PageType, CustomerType } from '../../types';
import { CHANNEL_CONFIG } from '../constants';
import {
    calculateDuration,
    formatHistoryDateTime,
    formatRawChannelType,
} from '../helpers';

export type HistoryItemProps = {
    historyActivity: ActivityLog;
    hideDivider?: boolean;
    section: PageType;
    highlightDialogId: string;
};

export const HistoryItem = ({
    historyActivity,
    hideDivider = false,
    section,
    highlightDialogId = '',
}: HistoryItemProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const {
        agentSummary,
        autoSummary,
        dispositionName,
        agentNotes,
        creationTime,
        completionTime,
    } = historyActivity;

    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const aiSummaryRef = useRef<HTMLParagraphElement>(null);
    const historyItemRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

    const channelConfig = CHANNEL_CONFIG[formatRawChannelType(historyActivity)];

    const aiSummary = agentSummary ? agentSummary : autoSummary;

    const showHighlight = highlightDialogId === historyActivity.dialogId;

    const showDispositionVerticalLine = dispositionName
        ? !!agentNotes || !!aiSummary
        : !!aiSummary;

    const durationBlock = creationTime && (
        <div
            className='flex flex-1 gap-2'
            data-aid={CONTACT_MANAGEMENT_HISTORY_TIME}
        >
            <Text
                className={clsx(
                    'typography-descriptor',
                    showHighlight ? 'text-neutral-b1' : 'text-neutral-b2'
                )}
            >
                {formatHistoryDateTime(creationTime)}
            </Text>
            {completionTime && (
                <Text
                    className={clsx(
                        'typography-descriptor italic',
                        showHighlight
                            ? 'text-neutral-b1'
                            : 'text-neutral-b0-t50'
                    )}
                    data-aid={CONTACT_MANAGEMENT_HISTORY_DURATION}
                >
                    {calculateDuration(creationTime, completionTime)}
                </Text>
            )}
        </div>
    );

    const handleDataTracking = (isExpanded: boolean) => {
        const action = isExpanded ? 'show less' : 'show more';
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.KnownCustomer,
            section,
            action,
        });
    };

    useEffect(() => {
        const element = aiSummaryRef.current;
        if (element) {
            setIsOverflowing(element.scrollHeight > element.clientHeight);
        }
    }, []);

    return (
        <div
            className={clsx(
                'flex flex-col gap-1 px-4 pt-4',
                showHighlight && 'bg-primary-b bg-opacity-10'
            )}
            data-aid={CONTACT_MANAGEMENT_HISTORY_ITEM}
            ref={historyItemRef}
        >
            <div
                className='flex gap-3'
                data-aid={CONTACT_MANAGEMENT_HISTORY_DISPOSITION}
            >
                <HistoryIcon
                    symbol={channelConfig?.symbol}
                    tooltipTitle={channelConfig?.name ?? ''}
                    showVerticalLine={showDispositionVerticalLine}
                    className={clsx(dispositionName && 'pt-0.5')}
                />
                {dispositionName ? (
                    <div className='min-w-0'>
                        <Text
                            titleWhenOverflow={1}
                            useTooltip
                            className='typography-subtitleBold text-neutral-b0 line-clamp-1 whitespace-normal break-words'
                        >
                            {dispositionName}
                        </Text>
                    </div>
                ) : (
                    durationBlock
                )}
            </div>
            {!!aiSummary && (
                <div
                    className='flex gap-3'
                    data-aid={CONTACT_MANAGEMENT_HISTORY_AI_SUMMARY}
                >
                    <HistoryIcon
                        symbol={AiStarsMd}
                        showVerticalLine={!!dispositionName && !!agentNotes}
                    />
                    <div className='min-w-0'>
                        <p
                            ref={aiSummaryRef}
                            id='text-content'
                            className={clsx(
                                !isExpanded && 'relative line-clamp-3',
                                'typography-mainText text-neutral-b0 whitespace-normal break-words'
                            )}
                        >
                            {aiSummary}
                            {isOverflowing && (
                                <span
                                    onClick={() => {
                                        handleDataTracking(isExpanded);
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className={clsx(
                                        !isExpanded &&
                                            'absolute bottom-0 right-0',
                                        'text-primary-b bg-neutral-w0'
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            !isExpanded && 'inline-block',
                                            showHighlight &&
                                                'bg-primary-b bg-opacity-10',
                                            'cursor-pointer px-1'
                                        )}
                                    >
                                        {!isExpanded
                                            ? translate(
                                                  'CHAT.INTERACTION_HISTORY.SHOW_MORE'
                                              )
                                            : translate(
                                                  'CHAT.INTERACTION_HISTORY.SHOW_LESS'
                                              )}
                                    </span>
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )}
            {!!agentNotes && (
                <div
                    className='flex gap-3'
                    data-aid={CONTACT_MANAGEMENT_HISTORY_AGENT_NOTE}
                >
                    <HistoryIcon symbol={NotesMd} />
                    <div className='flex min-w-0 justify-start'>
                        <Text
                            className={clsx(
                                'typography-descriptor inline-block whitespace-normal break-words pr-1 italic',
                                showHighlight
                                    ? 'text-neutral-b1'
                                    : 'text-neutral-b2'
                            )}
                        >
                            {agentNotes}
                        </Text>
                    </div>
                </div>
            )}
            {!!creationTime && dispositionName && (
                <div className='flex gap-3'>
                    <div className='flex w-4 flex-none' />
                    {durationBlock}
                </div>
            )}
            {hideDivider ? (
                <div className='mt-3' />
            ) : (
                <Divider className='mt-3 border-b-neutral-200' />
            )}
        </div>
    );
};
