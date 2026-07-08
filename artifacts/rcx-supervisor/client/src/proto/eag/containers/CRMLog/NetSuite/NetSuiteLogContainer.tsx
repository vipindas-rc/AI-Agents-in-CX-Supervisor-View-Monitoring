import type { FC } from 'react';

import { NetSuiteCallLogContainer } from './NetSuiteCallLogContainer';
import { NetSuiteMessageLogContainer } from './NetSuiteMessageLogContainer';
import type { NetSuiteLogContainerProps } from './types';
import { ParamsType } from '../../../constants/crm';

export const NetSuiteLogContainer: FC<NetSuiteLogContainerProps> = (props) => {
    return props.engageType === ParamsType.Call ? (
        <NetSuiteCallLogContainer {...props} />
    ) : (
        <NetSuiteMessageLogContainer {...props} />
    );
};
