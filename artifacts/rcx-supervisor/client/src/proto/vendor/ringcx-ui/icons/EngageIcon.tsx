import type { FC } from 'react';

import type { IIcon } from './types/Icon';

interface IEngageIcon extends IIcon {
    icon: string;
}

const EngageIcon: FC<IEngageIcon> = ({
    icon,
    className = '',
    ...restProps
}) => <i className={`${icon} ${className}`} {...restProps} />;

export default EngageIcon;
