import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Back: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-back'} {...props} />
);
