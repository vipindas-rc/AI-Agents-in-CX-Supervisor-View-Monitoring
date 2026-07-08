import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const WhatsApp: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-whats_app'} {...props} />
);
