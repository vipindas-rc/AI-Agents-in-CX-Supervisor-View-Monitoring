import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Internet: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-internet' {...props} />
);
