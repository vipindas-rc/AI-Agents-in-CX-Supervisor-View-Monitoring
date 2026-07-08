import type { FC } from 'react';

import DigitalIcon from './DigitalIcon';
import type { IIcon } from './types/Icon';

export const NexmoSms: FC<IIcon> = (props) => (
    <DigitalIcon icon={'digital-icon-new_s_nexmo'} {...props} />
);
