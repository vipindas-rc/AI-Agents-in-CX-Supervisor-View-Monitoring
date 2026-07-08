import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const DialPad: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-dialpad'} {...props} />
);
