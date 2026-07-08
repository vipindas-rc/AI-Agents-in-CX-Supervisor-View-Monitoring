import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Channels: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-channels'} {...props} />
);
