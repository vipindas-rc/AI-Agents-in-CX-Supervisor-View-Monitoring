import type { FC } from 'react';

import * as SpringIcons from '@ringcentral/spring-icon';

import CreateAngularModule from '../../helpers/CreateAngularModule';
type SpringIconsType = keyof typeof SpringIcons;
interface SpringIconProps {
    iconName: SpringIconsType;
}
export const SpringIconsBase: FC<SpringIconProps> = ({ iconName }) => {
    const IconComponent = (
        SpringIcons as Record<string, React.ComponentType<{ fill?: string }>>
    )[iconName];
    return IconComponent ? <IconComponent fill='currentColor' /> : null;
};

export default CreateAngularModule(
    'angularSpringIcon',
    SpringIconsBase,
    ['iconName'],
    []
);
