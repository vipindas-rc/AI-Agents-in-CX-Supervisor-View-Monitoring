import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const StackView: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-stackview'} {...props} />
);
