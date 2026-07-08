import type { FC } from 'react';

import { RcIcon } from '@ringcentral/juno';
import * as JunoIcons from '@ringcentral/juno-icon';

import CreateAngularModule from '../../helpers/CreateAngularModule';
import { withBrandTheme } from '../../helpers/withBrandTheme';

interface JunoIconProps {
    iconName: string;
}

const JunoIconBase: FC<JunoIconProps> = ({ iconName }) => {
    const IconComponent = JunoIcons[iconName as keyof typeof JunoIcons];

    return IconComponent ? <RcIcon symbol={IconComponent} /> : null;
};

export const JunoIcon = withBrandTheme(JunoIconBase);

export default CreateAngularModule('junoIcon', JunoIcon, ['iconName'], []);
