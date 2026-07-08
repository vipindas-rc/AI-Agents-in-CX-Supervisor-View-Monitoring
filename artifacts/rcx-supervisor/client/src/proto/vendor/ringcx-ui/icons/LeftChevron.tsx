import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const LeftChevron: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-leftchevron'} {...props} />
);
