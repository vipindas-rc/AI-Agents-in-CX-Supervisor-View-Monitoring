import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const OutboundCall: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-outboundcall'} {...props} />
);
