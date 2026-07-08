import type { FC } from 'react';

import { AlertMd } from '@ringcentral/spring-icon';
import { Alert } from '@ringcentral/spring-ui';

import { useBehaviorSubject } from '../../../../helpers/useBehaviorSubject';
import { usePlayerContext } from '../Player/PlayerContext';

export const Notifications: FC = () => {
    const { playerController } = usePlayerContext();
    const notifications = useBehaviorSubject(playerController.$notifications);

    return (
        <div className='fixed right-2 top-2 flex max-h-[calc(100vh-0.5rem)] w-[400px] flex-col gap-2 overflow-auto pb-2'>
            {notifications.map((notification, index) => (
                <Alert
                    key={index}
                    severity={notification.type}
                    startSlot={AlertMd}
                >
                    {notification.message}
                </Alert>
            ))}
        </div>
    );
};
