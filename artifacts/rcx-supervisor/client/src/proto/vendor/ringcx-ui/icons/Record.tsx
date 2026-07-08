import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Record: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-record'} {...props} />
);
