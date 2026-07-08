import type { FC } from 'react';

import { HubSpotCallLogContainer } from './HubSpotCallLogContainer';
import { HubSpotMessageLogContainer } from './HubSpotMessageLogContainer';
import type { HubSpotLogContainerProps } from './types';
import { ParamsType } from '../../../constants/crm';

export const HubSpotLogContainer: FC<HubSpotLogContainerProps> = (props) => {
    return props.engageType === ParamsType.Call ? (
        <HubSpotCallLogContainer {...props} />
    ) : (
        <HubSpotMessageLogContainer {...props} />
    );
};
