import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const RssFeed: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-feed2'} {...props} />
);
