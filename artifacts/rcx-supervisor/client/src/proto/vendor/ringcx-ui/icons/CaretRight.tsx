import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const CaretRight: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-caret-right' {...props} />
);
