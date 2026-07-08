import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const EngageMessaging: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-mobile-messaging'} {...props} />
);
