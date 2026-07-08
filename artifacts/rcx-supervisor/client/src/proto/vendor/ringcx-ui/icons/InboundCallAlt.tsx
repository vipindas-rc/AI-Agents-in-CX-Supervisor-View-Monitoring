import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const InboundCallAlt: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-inboundcall-filled'} {...props} />
);
