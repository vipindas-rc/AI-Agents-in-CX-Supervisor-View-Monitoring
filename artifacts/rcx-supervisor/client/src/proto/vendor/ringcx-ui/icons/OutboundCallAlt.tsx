import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const OutboundCallAlt: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-outboundcall-filled'} {...props} />
);
