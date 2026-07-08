import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const TransferDigital: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-arrow-right4'} {...props} />
);
