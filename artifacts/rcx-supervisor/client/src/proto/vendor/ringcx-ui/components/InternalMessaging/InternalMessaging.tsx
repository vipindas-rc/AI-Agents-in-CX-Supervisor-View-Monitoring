import { memo, useEffect } from 'react';
import type { FC } from 'react';

import { Session, UserService } from '@ringcx/shared';

import { StyledInternalMessagingContainer } from './InternalMessagingContainer.styled';
import type { IInternalMessaging } from './types/InternalMessaging';

declare global {
    interface Window {
        ED_InternalMessaging: {
            render: (element: HTMLElement | null, jwt?: string) => void;
        };
    }
}

const InternalMessaging: FC<IInternalMessaging> = ({
    digitalJWTModifier,
    agentId,
}) => {
    useEffect(() => {
        Session.getDigitalJwt({
            modifier: digitalJWTModifier,
            agentId: agentId,
        })
            .then(async (jwt) => {
                const userDetails = await UserService.getLoggedInUser({});
                if (
                    userDetails.digitalAgentEnabled &&
                    userDetails.digitalAccountEmbedUrl
                ) {
                    try {
                        const script = document.createElement('script');
                        script.src = `${userDetails.digitalAccountEmbedUrl}/internal_messaging/script.js`;
                        script.async = true;
                        script.addEventListener('load', function () {
                            window.ED_InternalMessaging.render(
                                document.getElementById(
                                    'internal-messaging-container'
                                ),
                                jwt
                            );
                        });
                        document.body.appendChild(script);
                    } catch (e) {
                        console.error(
                            'There was an error during the load of the internal messaging script',
                            e
                        );
                    }
                }
            })
            .catch((e) => {
                // Do nothing
            });

        return () => {
            const scriptElement = document.getElementById(
                'internal-messaging-script'
            );
            if (scriptElement) {
                document.body.removeChild(scriptElement);
            }
        };
    });

    return (
        <StyledInternalMessagingContainer id='internal-messaging-container' />
    );
};

export default memo(InternalMessaging);
