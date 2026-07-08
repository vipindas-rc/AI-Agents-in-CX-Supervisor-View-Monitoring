import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Notifications } from './components/Notifications/Notifications';
import { RemoteNetworkQualityIndicator } from './components/Player/components/RemoteNetworkQualityIndicator/RemoteNetworkQualityIndicator';
import { Player } from './components/Player/Player';
import type { PlayerController } from '../../common/services/LiveMonitoringSupervisorService/lib/PlayerController/PlayerController';

interface LiveMonitoringWindowProps {
    playerController: PlayerController;
}

export const LiveMonitoringWindow: FC<LiveMonitoringWindowProps> = ({
    playerController,
}) => {
    const { t } = useTranslation();
    const { fullName } = playerController.options;

    return (
        <div data-sui-theme-scope>
            <div className='flex h-screen w-screen flex-col items-center justify-around overflow-auto p-6'>
                <div className='min-w-[400px] max-w-[min(1920px,100vw-24px*2)]'>
                    <div className='py-6'>
                        <h1 className='m-0 flex items-center gap-2 text-lg font-medium'>
                            {t('LIVE_MONITORING.SUPERVISOR.PLAYER.TITLE')}:{' '}
                            {fullName}
                            <RemoteNetworkQualityIndicator
                                playerController={playerController}
                            />
                        </h1>
                    </div>
                    <Player playerController={playerController} />
                </div>
            </div>
        </div>
    );
};
