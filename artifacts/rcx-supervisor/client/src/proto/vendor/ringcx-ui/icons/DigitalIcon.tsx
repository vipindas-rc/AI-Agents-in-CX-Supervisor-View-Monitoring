import type { FC } from 'react';

import type { IIcon } from './types/Icon';

interface IDigitalIcon extends IIcon {
    icon: string;
}

const DigitalIcon: FC<IDigitalIcon> = ({
    icon,
    className = '',
    ...restProps
}) => <i className={`${icon} ${className}`} {...restProps} />;

export default DigitalIcon;
