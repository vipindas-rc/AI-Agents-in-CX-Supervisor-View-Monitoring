import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const EngageDigitalSourceSdk: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-dimelo-sdk'} {...props} />
);
