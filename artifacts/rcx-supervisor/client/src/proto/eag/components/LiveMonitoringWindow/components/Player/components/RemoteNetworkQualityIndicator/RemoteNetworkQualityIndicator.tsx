import type { FC } from 'react';

import type { PlayerController } from '../../../../../../common/services/LiveMonitoringSupervisorService/lib/PlayerController/PlayerController';
import { useBehaviorSubject } from '../../../../../../helpers/useBehaviorSubject';
import { NetworkQualityIndicator } from '../NetworkQualityIndicator/NetworkQualityIndicator';

export type RemoteNetworkQualityIndicatorProps = {
    playerController: PlayerController;
};

export const RemoteNetworkQualityIndicator: FC<
    RemoteNetworkQualityIndicatorProps
> = ({ playerController }) => {
    const remoteNqi = useBehaviorSubject(playerController.$remoteNqi);

    if (remoteNqi === null) {
        return null;
    }

    return <NetworkQualityIndicator value={remoteNqi} />;
};
