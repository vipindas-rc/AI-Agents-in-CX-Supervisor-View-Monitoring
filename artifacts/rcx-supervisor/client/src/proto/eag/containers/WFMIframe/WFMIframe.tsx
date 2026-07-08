import { useEffect, useState } from 'react';

import { Session } from '@ringcx/shared';
import { Spinner, TechnicalIssuePage } from '@ringcx/ui';

import { WFM_CLIENT_ID, WFM_PATH } from './constants';
import { SpinnerWrapper, WFMIframeContainer } from './WFMIframe.styled';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const WFMIframe = ({
    subAccountId,
    aiWfmDashboardUrl,
}: {
    subAccountId: string;
    aiWfmDashboardUrl: string;
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        let inProgress = true;

        (async () => {
            if (!subAccountId) {
                console.error('[WFM DASHBOARD] - missing subAccountId');
                setIsLoading(false);
                return;
            }

            if (!aiWfmDashboardUrl) {
                console.error('[WFM DASHBOARD] - missing aiWfmDashboardUrl');
                setIsLoading(false);
                return;
            }

            let code;

            try {
                code = await Session.getRCAuthCode(WFM_CLIENT_ID);
            } catch (error) {
                console.error(
                    '[WFM DASHBOARD] - unable to retrieve auth code',
                    error
                );
                setIsLoading(false);
                return;
            }

            try {
                if (!inProgress) {
                    return;
                }

                if (!code) {
                    console.error('[WFM DASHBOARD] - missing auth code');
                    setIsLoading(false);
                    return;
                }

                const params = new URLSearchParams({
                    code,
                    subAccountId,
                    path: WFM_PATH,
                });

                // massage the redirect URL coming back from the API
                // TODO: instead of getting the baseDomain, it would be better to fix the redirect URL being sent in the API to be the correct URL
                const baseDomain = aiWfmDashboardUrl.substring(
                    0,
                    aiWfmDashboardUrl.indexOf('?')
                );
                const url = `${baseDomain}?${params.toString()}`;
                setUrl(url);
            } catch (error) {
                console.error('[WFM DASHBOARD] - error', error);
            } finally {
                if (inProgress) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            inProgress = false;
        };
    }, [subAccountId, aiWfmDashboardUrl]);

    if (isLoading) {
        return (
            <SpinnerWrapper>
                <Spinner className='m-auto' />
            </SpinnerWrapper>
        );
    }

    return url ? (
        <WFMIframeContainer src={url} title='aiwfm' />
    ) : (
        <TechnicalIssuePage />
    );
};

export default CreateAngularModule('wfmIframe', WFMIframe, [
    'subAccountId',
    'aiWfmDashboardUrl',
]);
