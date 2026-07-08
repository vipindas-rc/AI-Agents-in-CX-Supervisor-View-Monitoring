import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const CalendarAlt: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-calendar' {...props} />
);
