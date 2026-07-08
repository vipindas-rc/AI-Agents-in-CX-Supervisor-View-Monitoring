import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ShowPassword: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-showpassword'} {...props} />
);
