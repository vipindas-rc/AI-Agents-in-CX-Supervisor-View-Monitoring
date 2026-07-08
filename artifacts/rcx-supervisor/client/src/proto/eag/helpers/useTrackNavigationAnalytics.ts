import { useEffect } from 'react';

import { type Analytics, Session } from '@ringcx/shared';

import { NAVIGATION_TAB_EVENT } from '../constants/analyticsEvents';

export const useTrackNavigationAnalytics = (
    currentRoute: string,
    analyticsService: Analytics
) => {
    const isAgentJupiterEnv = Session.isEmbeddedAgentClientAppType();

    useEffect(() => {
        switch (currentRoute) {
            case '#/home/chat': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: isAgentJupiterEnv
                        ? 'tabActiveMessages'
                        : 'Viewed My Messages',
                });
                break;
            }
            case '#/home/digital/folderMode': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: isAgentJupiterEnv
                        ? 'tabAllMessages'
                        : 'Viewed All Messages',
                });
                break;
            }
            case '#/home/phone/preview': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: 'tabDialing',
                });
                break;
            }
            case '#/home/phone/callbacks/callbackDetail': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: 'tabCallbacks',
                });
                break;
            }
            case '#/home/phone/leads/leadManagement/': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: 'tabSearch',
                });
                break;
            }
            case '#/home/scripts': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: 'tabScripts',
                });
                break;
            }
            case '#/home/phone/stats/metrics': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: isAgentJupiterEnv ? 'Stats' : 'Viewed My Stats',
                });
                break;
            }
            case '#/home/supervisor/agent': {
                analyticsService.track(NAVIGATION_TAB_EVENT, {
                    option: isAgentJupiterEnv
                        ? 'tabSupervisor'
                        : 'Viewed Supervisor',
                });
                break;
            }
        }
    }, [currentRoute, analyticsService, isAgentJupiterEnv]);
};
