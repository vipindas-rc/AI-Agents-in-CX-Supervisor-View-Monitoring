import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Tag: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-tag'} {...props} />
);
