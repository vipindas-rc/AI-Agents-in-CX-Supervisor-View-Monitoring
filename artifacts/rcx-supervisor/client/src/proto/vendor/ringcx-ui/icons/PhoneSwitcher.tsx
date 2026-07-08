import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const PhoneSwitcher: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-phone-switcher'} {...props} />
);
