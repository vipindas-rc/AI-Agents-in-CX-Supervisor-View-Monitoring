import type { FC } from 'react';
import { useCallback } from 'react';

import { RcTypography } from '@ringcentral/juno';
import { useTranslation } from 'react-i18next';

import { BigActionButton } from '../../components/BigActionButton/BigActionButton';
import { EmptyStateImage } from '../../components/Splash/components/EmptyStateImage';
import { Splash } from '../../components/Splash/Splash';
import { SPLASH_TYPES } from '../../constants/emptyStates';
import { INTERACTION_RNA_READY_BUTTON } from '../../constants/testIds';

type InteractionRNAEmptyProps = {
    SessionSvc: any;
    AgentSvc: any;
};

export const InteractionRNAEmpty: FC<InteractionRNAEmptyProps> = ({
    SessionSvc,
    AgentSvc,
}) => {
    const { t } = useTranslation();

    const onGoAvailableFromRNA = useCallback(() => {
        SessionSvc.setSuppressFirstStateChange(true);
        AgentSvc.setAgentState('AVAILABLE');
    }, [AgentSvc, SessionSvc]);

    return (
        <Splash
            text={t('INTERACTION.RNA_PAGE.TITLE')}
            subText={t('INTERACTION.RNA_PAGE.SUBTEXT')}
            icon={<EmptyStateImage type='NoVoiceQueue' />}
            splashType={SPLASH_TYPES.SIDE_PANEL}
            button={
                <BigActionButton
                    data-aid={INTERACTION_RNA_READY_BUTTON}
                    title={t('INTERACTION.RNA_PAGE.BUTTON')}
                    onClick={onGoAvailableFromRNA}
                >
                    <RcTypography>
                        {t('INTERACTION.RNA_PAGE.BUTTON')}
                    </RcTypography>
                </BigActionButton>
            }
        />
    );
};
