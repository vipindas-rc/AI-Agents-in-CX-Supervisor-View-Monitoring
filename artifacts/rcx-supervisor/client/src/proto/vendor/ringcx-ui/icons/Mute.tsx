import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Mute: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-mute'} {...props} />
);
