import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const Default: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-source_default'} {...props} />
);
