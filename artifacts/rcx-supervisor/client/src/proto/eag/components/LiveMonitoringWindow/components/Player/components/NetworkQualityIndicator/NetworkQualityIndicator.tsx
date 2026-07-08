import type { FC } from 'react';

import {
    BadConnectionMd,
    WeakConnectionMd,
    GoodConnectionMd,
} from '@ringcentral/spring-icon';
import { Icon } from '@ringcentral/spring-ui';

import { ReactComponent as NoConnectionMd } from './noConnectionIcon.svg';
import type { NQI } from '../../../../../../common/services/LiveMonitoringSupervisorService/lib/PlayerController/types';

export type NetworkQualityIndicatorProps = {
    value: NQI;
};

export const NetworkQualityIndicator: FC<NetworkQualityIndicatorProps> = ({
    value,
}) => {
    const symbol = {
        0: NoConnectionMd,
        1: BadConnectionMd,
        2: WeakConnectionMd,
        3: GoodConnectionMd,
    }[value];

    return <Icon symbol={symbol} size='small' />;
};
