import type { FC } from 'react';

import * as EngageIcon from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export const EuiIcon: FC<{
    iconName: string;
    className?: string;
    size?: string;
}> = ({ iconName, ...restProps }) => {
    // @ts-ignore
    // eslint-disable-next-line import/namespace
    const Component = EngageIcon[iconName];

    if (iconName && Component) {
        return <Component {...restProps} />;
    } else {
        return <div />;
    }
};

export default CreateAngularModule(
    'euiIcon',
    EuiIcon,
    ['iconName', 'className', 'size'],
    []
);
