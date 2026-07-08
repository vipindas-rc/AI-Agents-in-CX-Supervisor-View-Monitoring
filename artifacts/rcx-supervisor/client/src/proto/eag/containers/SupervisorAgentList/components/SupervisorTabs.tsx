import type { FC } from 'react';

import CreateAngularModule from '../../../helpers/CreateAngularModule';
import { EuiSegments } from '../../EuiSegments/EuiSegments';
import type { IEuiSegments } from '../../EuiSegments/types/EuiSegments';

export const SupervisorTabs: FC<IEuiSegments> = ({
    segmentLabels,
    selectedIndex,
    setSelectedType,
    segmentsBadgeCount,
}) => (
    <EuiSegments
        {...{
            selectedIndex,
            segmentLabels,
            setSelectedType,
            size: 'small',
            segmentsBadgeCount,
        }}
    />
);

export default CreateAngularModule(
    'supervisorTabs',
    SupervisorTabs,
    [
        'segmentLabels',
        'size',
        'selectedIndex',
        'setSelectedType',
        'segmentsBadgeCount',
    ],
    []
);
