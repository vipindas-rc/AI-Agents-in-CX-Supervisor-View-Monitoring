import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const SmsMms: FC<IIcon> = (props) => (
    <EngageIcon icon={'digital-icon-sms'} {...props} />
);
