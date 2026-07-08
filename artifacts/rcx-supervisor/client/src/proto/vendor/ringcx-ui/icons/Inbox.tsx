import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Inbox: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-inbox'} {...props} />
);
