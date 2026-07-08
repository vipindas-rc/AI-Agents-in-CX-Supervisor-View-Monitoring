import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const More: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-more'} {...props} />
);
