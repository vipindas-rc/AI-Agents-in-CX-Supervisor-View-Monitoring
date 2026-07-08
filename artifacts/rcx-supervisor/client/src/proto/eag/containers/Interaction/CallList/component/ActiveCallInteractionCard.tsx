import { useEffect, useState } from 'react';

import { IncomingCallMd, OutgoingCallMd } from '@ringcentral/spring-icon';
import { Text, Icon } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import {
    ACTIVE_CALL_CARD,
    CONTACT_NAME,
    INTERACTION_TYPE_ICON,
    CALL_SOURCE,
} from '../../../../constants/testIds';
import {
    getCallSourceDescription,
    isVoiceInteractionDetailActive,
    VOICE_CALL_TYPE,
} from '../../helper/helper';
import { InteractionCardWrapper } from '../../InteractionCardWrapper';

type ActiveCallInteractionCardProps = {
    CallSvc: any;
    JupiterService: any;
    $rootScope: any;
    CALL_EVENTS: any;
    $state: any;
};

export const ActiveCallInteractionCard = ({
    CallSvc,
    JupiterService,
    $rootScope,
    CALL_EVENTS,
    $state,
}: ActiveCallInteractionCardProps) => {
    const { t } = useTranslation();
    const currentCall = CallSvc.currentCall;
    const selected = isVoiceInteractionDetailActive($state);

    const callIconSymbol =
        currentCall.callType === VOICE_CALL_TYPE.OUTBOUND
            ? OutgoingCallMd
            : IncomingCallMd;

    const [name, setName] = useState<string>(() =>
        JupiterService.getLeadName(currentCall)
    );

    const callSourceDescription = getCallSourceDescription(currentCall);

    useEffect(() => {
        const offUpdateCallerId = $rootScope.$on(
            CALL_EVENTS.UPDATE_CALLER_ID_SESSION,
            () => setName(JupiterService.getLeadName(currentCall))
        );

        return () => {
            offUpdateCallerId();
        };
    }, [$rootScope, currentCall, JupiterService, CALL_EVENTS]);

    const handleCardClick = () => {
        $state.go('base.default.interaction.phone.detail', {
            uii: currentCall.uii,
        });
    };

    return (
        <InteractionCardWrapper
            active={selected}
            onClick={handleCardClick}
            data-aid={ACTIVE_CALL_CARD}
            data-interaction-card
        >
            <div className='cursor-pointer text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='w-fit' data-aid={INTERACTION_TYPE_ICON}>
                        <Icon
                            symbol={callIconSymbol}
                            size='xsmall'
                            className='text-neutral-b2'
                        />
                    </div>
                    <div className='min-w-0 flex-1' data-aid={CONTACT_NAME}>
                        <Text
                            useTooltip
                            titleWhenOverflow={1}
                            className='typography-subtitle line-clamp-1 font-bold'
                        >
                            {name || t('SOFTPHONE.MANUAL_OUTDIAL.UNKNOWN')}
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
                                {callSourceDescription}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </InteractionCardWrapper>
    );
};
