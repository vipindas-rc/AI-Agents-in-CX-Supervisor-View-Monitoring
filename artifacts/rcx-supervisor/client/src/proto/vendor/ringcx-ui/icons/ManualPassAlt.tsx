import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ManualPassAlt: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-manualpass_filled'} {...props} />
);
