import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Settings: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-settings'} {...props} />
);
