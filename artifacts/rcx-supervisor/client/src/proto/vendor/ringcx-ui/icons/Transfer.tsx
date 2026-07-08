import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Transfer: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-transfer'} {...props} />
);
