import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const HidePassword: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-hidepassword'} {...props} />
);
