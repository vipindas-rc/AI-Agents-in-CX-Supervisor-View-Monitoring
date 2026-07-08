import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Download: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-download'} {...props} />
);
