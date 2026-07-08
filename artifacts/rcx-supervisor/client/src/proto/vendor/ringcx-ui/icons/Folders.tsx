import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Folders: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-new_nav-folders'} {...props} />
);
