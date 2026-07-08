import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const Instagram: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-instagram'} {...props} />
);
