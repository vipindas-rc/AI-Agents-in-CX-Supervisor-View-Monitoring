import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Kebab: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-kebab'} {...props} />
);
