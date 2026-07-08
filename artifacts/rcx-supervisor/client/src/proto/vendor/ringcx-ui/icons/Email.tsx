import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const Email: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-envelop'} {...props} />
);
