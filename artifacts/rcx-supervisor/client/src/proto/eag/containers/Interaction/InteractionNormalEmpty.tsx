import { Fragment, type FC, type MouseEvent } from 'react';

import { Link } from '@ringcentral/spring-ui';
import { Trans, useTranslation } from 'react-i18next';

import { InteractionQuickActions } from './InteractionQuickActions';
import { EmptyStateImage } from '../../components/Splash/components/EmptyStateImage';
import { Splash } from '../../components/Splash/Splash';
import { SPLASH_TYPES } from '../../constants/emptyStates';

type InteractionNormalEmptyProps = {
    $state: any;
    AgentSvc: any;
    AnalyticsSvc: any;
    SessionSvc: any;
    chatSvc: any;
    JupiterService: any;
    $rootScope: any;
    AGENT_EVENTS: any;
};

export const InteractionNormalEmpty: FC<InteractionNormalEmptyProps> = ({
    $state,
    AgentSvc,
    AnalyticsSvc,
    SessionSvc,
    chatSvc,
    JupiterService,
    $rootScope,
    AGENT_EVENTS,
}) => {
    const { t } = useTranslation();
    const showUpdateSessionHint = AgentSvc.agentPermissions.allowLoginUpdates;
    const handleUpdateSessionClick = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        $state.go('base.default.updatelogin');
    };

    const panelSubtext = (
        <Fragment>
            {t('INTERACTION.EMPTY_PAGE.SUBTEXT')}
            {showUpdateSessionHint && (
                <Fragment>
                    {' '}
                    <Trans
                        i18nKey='INTERACTION.EMPTY_PAGE.UPDATE_SESSION_TEXT'
                        components={{
                            sessionLink: (
                                <Link
                                    href='#update-session'
                                    underline='always'
                                    variant='primary'
                                    style={{ textDecoration: 'underline' }}
                                    onClick={handleUpdateSessionClick}
                                />
                            ),
                        }}
                    />
                </Fragment>
            )}
        </Fragment>
    );

    return (
        <Splash
            text={t('INTERACTION.EMPTY_PAGE.TITLE')}
            subText={panelSubtext}
            icon={<EmptyStateImage type='NoInteractionHistory' />}
            splashType={SPLASH_TYPES.SIDE_PANEL}
            button={
                <InteractionQuickActions
                    variant='empty'
                    AnalyticsSvc={AnalyticsSvc}
                    AgentSvc={AgentSvc}
                    SessionSvc={SessionSvc}
                    chatSvc={chatSvc}
                    JupiterService={JupiterService}
                    $rootScope={$rootScope}
                    AGENT_EVENTS={AGENT_EVENTS}
                />
            }
        />
    );
};
