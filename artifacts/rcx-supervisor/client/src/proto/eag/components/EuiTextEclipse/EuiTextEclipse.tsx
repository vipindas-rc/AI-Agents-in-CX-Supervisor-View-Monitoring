import type { ReactNode } from 'react';

import type { ITextEclipse } from '@ringcx/ui';
import { TextEclipse } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

interface IEuiTextEclipse extends ITextEclipse {
    children?: ReactNode;
    disablePortal?: boolean;
}

export const EuiTextEclipse = ({
    tooltipMsg,
    disablePortal,
    placement,
    children,
}: IEuiTextEclipse) => (
    <TextEclipse
        tooltipMsg={tooltipMsg}
        popperProps={{ disablePortal: disablePortal }}
        placement={placement}
    >
        {children ? children : tooltipMsg}
    </TextEclipse>
);

export default CreateAngularModule('textEclipse', EuiTextEclipse, [
    'tooltipMsg',
    'children',
    'disablePortal',
    'placement',
]);
