import type { FC } from 'react';
import { useCallback } from 'react';

import { AlertMd } from '@ringcentral/spring-icon';
import { Button, IconButton, Text } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { CALL_RNA_STATE_CARD } from '../../../../constants/testIds';
import { InteractionCardWrapper } from '../../InteractionCardWrapper';

type RnaStateCardProps = {
    SessionSvc: any;
    AgentSvc: any;
};

export const RnaStateCard: FC<RnaStateCardProps> = ({
    SessionSvc,
    AgentSvc,
}) => {
    const { t } = useTranslation();

    const handleChangeToAvailable = useCallback(() => {
        SessionSvc.setSuppressFirstStateChange(true);
        AgentSvc.setAgentState('AVAILABLE');
    }, [AgentSvc, SessionSvc]);

    return (
        <InteractionCardWrapper
            data-aid={CALL_RNA_STATE_CARD}
            data-interaction-card='false'
        >
            <div className='flex items-center gap-2'>
                <div className='w-fit'>
                    <IconButton
                        symbol={AlertMd}
                        label={t('INTERACTION.RNA_PAGE.TITLE')}
                        variant='icon'
                        size='small'
                        color='danger'
                        className='w-4 px-0'
                    />
                </div>
                <div className='min-w-0 flex-1'>
                    <Text className='typography-subtitleMini text-neutral-b1 text-sm'>
                        {t('INTERACTION.RNA_PAGE.TITLE')}
                    </Text>
                </div>
            </div>
            <div className='space-y-1 pl-6'>
                <div>
                    <Text className='typography-descriptor text-neutral-b2'>
                        {t('INTERACTION.RNA_PAGE.SUBTEXT')}
                    </Text>
                </div>
                <Button
                    variant='text'
                    size='small'
                    className='typography-descriptorMini px-0 text-[12px]'
                    onClick={handleChangeToAvailable}
                >
                    {t('INTERACTION.RNA_PAGE.BUTTON')}
                </Button>
            </div>
        </InteractionCardWrapper>
    );
};
