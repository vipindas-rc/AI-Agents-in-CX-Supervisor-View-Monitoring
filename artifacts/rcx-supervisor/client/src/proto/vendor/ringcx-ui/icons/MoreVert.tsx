import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const MoreVert: FC<IIcon> = (props) => {
    const newProps = { style: { transform: 'rotate(90deg)' }, ...props };
    return <EngageIcon icon='icon-more' {...newProps} />;
};
