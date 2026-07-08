import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const Linkedin: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-linkedin'} {...props} />
);
