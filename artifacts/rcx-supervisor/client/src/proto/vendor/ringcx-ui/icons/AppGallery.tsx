import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const AppGallery: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-appgallery'} {...props} />
);
