import type { FC } from 'react';

import { useBehaviorSubject } from '../../../../../../helpers/useBehaviorSubject';
import { usePlayerContext } from '../../PlayerContext';
import { NetworkQualityIndicator } from '../NetworkQualityIndicator/NetworkQualityIndicator';

export const LocalNetworkQualityIndicator: FC = () => {
    const { playerController } = usePlayerContext();
    const localNqi = useBehaviorSubject(playerController.$localNqi);

    if (localNqi === null) {
        return null;
    }

    return <NetworkQualityIndicator value={localNqi} />;
};
