import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { Controls } from './components/Controls/Controls';
import { PlayerContextProvider } from './PlayerContext';
import type { PlayerController } from '../../../../common/services/LiveMonitoringSupervisorService/lib/PlayerController/PlayerController';
import { useBehaviorSubject } from '../../../../helpers/useBehaviorSubject';
import { Notifications } from '../Notifications/Notifications';

interface PlayerProps {
    playerController: PlayerController;
}

export const Player: FC<PlayerProps> = ({ playerController }) => {
    const { t } = useTranslation();
    const stream = useBehaviorSubject(playerController.$stream);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) {
            return;
        }
        videoElement.srcObject = stream;
    }, [stream]);

    return (
        <PlayerContextProvider
            rootRef={rootRef}
            playerController={playerController}
        >
            <div className='flex flex-col' ref={rootRef}>
                <div className='relative flex aspect-video h-[calc(100vh-98px-76px-24px*2)] min-h-[225px] w-full items-center justify-center bg-black'>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        controls={false}
                        className='max-h-full max-w-full bg-black'
                    />
                    {stream ? null : (
                        <div className='absolute text-white'>
                            {t('LIVE_MONITORING.SUPERVISOR.PLAYER.CONNECTING')}
                        </div>
                    )}
                </div>
                <Controls />
                <Notifications />
            </div>
        </PlayerContextProvider>
    );
};
