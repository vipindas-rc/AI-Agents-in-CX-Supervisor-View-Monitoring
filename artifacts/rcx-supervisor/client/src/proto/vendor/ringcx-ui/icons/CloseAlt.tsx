import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const CloseAlt: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-close-2' {...props} />
);
