import { type FC } from 'react';

import type { ZendeskLogContainerProps } from './types';
import { ZendeskCallLogContainer } from './ZendeskCallLogContainer';
import { ZendeskMessageLogContainer } from './ZendeskMessageLogContainer';
import { ParamsType } from '../../../constants/crm';

export const ZendeskLogContainer: FC<ZendeskLogContainerProps> = (props) => {
    return props.engageType === ParamsType.Call ? (
        <ZendeskCallLogContainer {...props} />
    ) : (
        <ZendeskMessageLogContainer {...props} />
    );
};
