import { type FC } from 'react';

import { IncomingCallMd } from '@ringcentral/spring-icon';
import { Icon, Text } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import {
    CALL_PREVIEW_CARD,
    INTERACTION_TYPE_ICON,
    LEAD_NAME,
    CALL_SOURCE,
} from '../../../../constants/testIds';
import { CallPreviewActions } from '../../../../containers/CallPreview/CallPreviewCard/CallPreviewActions';
import { isVoicePreviewUiState } from '../../helper/helper';
import { InteractionCardWrapper } from '../../InteractionCardWrapper';

type CallPreviewInteractionCardProps = {
    CallPreviewSvc: any;
    $state: any;
    countdown: number;
};

export const CallPreviewInteractionCard: FC<
    CallPreviewInteractionCardProps
> = ({ CallPreviewSvc, $state, countdown }) => {
    const { t } = useTranslation();

    const handleCardClick = () => {
        $state.go('base.default.interaction.phone.preview');
    };

    const {
        callPreviewInfo,
        isAutoAnswerOn,
        previewTime,
        previewTimeoutAction,
        pendingAction,
        onAcceptFromCard,
        onRejectFromCard,
    } = CallPreviewSvc;

    const selected = isVoicePreviewUiState($state.current?.name);
    const queueLabel = t('CHAT.CHAT_PREVIEW.QUEUE');
    const queueName = callPreviewInfo?.queue?.name || '';

    return (
        <InteractionCardWrapper
            className='cursor-pointer text-sm'
            onClick={handleCardClick}
            active={selected}
            data-aid={CALL_PREVIEW_CARD}
            data-interaction-card
        >
            <div className='flex items-center gap-2'>
                <div className='w-fit' data-aid={INTERACTION_TYPE_ICON}>
                    <Icon
                        symbol={IncomingCallMd}
                        size='xsmall'
                        className='text-neutral-b2'
                    />
                </div>
                <div className='min-w-0 flex-1' data-aid={LEAD_NAME}>
                    <Text
                        useTooltip
                        titleWhenOverflow={1}
                        className='typography-subtitle line-clamp-1 font-bold'
                    >
                        {CallPreviewSvc.getLeadName()}
                    </Text>
                </div>
            </div>

            <div className='pl-5.5 space-y-1'>
                <div className='flex items-center'>
                    <div className='min-w-0 flex-1' data-aid={CALL_SOURCE}>
                        <Text
                            useTooltip
                            titleWhenOverflow={1}
                            className='text-neutral-b2 typography-descriptor line-clamp-1'
                        >
                            {`${queueLabel} ${queueName}`}
                        </Text>
                    </div>
                </div>
                <div
                    className='flex items-center gap-1.5'
                    onClick={(e) => e.stopPropagation()}
                >
                    <CallPreviewActions
                        autoAnswer={isAutoAnswerOn}
                        duration={previewTime ?? 0}
                        countdown={countdown}
                        timeoutAction={previewTimeoutAction}
                        pendingAction={pendingAction}
                        onAccept={onAcceptFromCard}
                        onReject={onRejectFromCard}
                    />
                </div>
            </div>
        </InteractionCardWrapper>
    );
};
