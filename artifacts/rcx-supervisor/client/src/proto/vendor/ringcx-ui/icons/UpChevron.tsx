import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const UpChevron: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-upchevron'} {...props} />
);
