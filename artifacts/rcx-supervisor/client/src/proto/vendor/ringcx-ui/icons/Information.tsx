import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Information: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-information'} {...props} />
);
