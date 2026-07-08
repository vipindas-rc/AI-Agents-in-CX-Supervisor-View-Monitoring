import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const GearOutlined: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-gear-outlined' {...props} />
);
