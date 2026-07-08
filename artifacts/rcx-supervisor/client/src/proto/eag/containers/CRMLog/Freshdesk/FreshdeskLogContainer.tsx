import { type FC } from 'react';

import { FreshdeskCallLogContainer } from './FreshdeskCallLogContainer';
import { FreshdeskMessageLogContainer } from './FreshdeskMessageLogContainer';
import type { FreshdeskLogContainerProps } from './types';
import { ParamsType } from '../../../constants/crm';

export const FreshdeskLogContainer: FC<FreshdeskLogContainerProps> = (
    props
) => {
    return props.engageType === ParamsType.Call ? (
        <FreshdeskCallLogContainer {...props} />
    ) : (
        <FreshdeskMessageLogContainer {...props} />
    );
};
