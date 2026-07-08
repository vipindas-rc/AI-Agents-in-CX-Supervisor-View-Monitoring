import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const TapaTalk: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-tapatalk'} {...props} />
);
