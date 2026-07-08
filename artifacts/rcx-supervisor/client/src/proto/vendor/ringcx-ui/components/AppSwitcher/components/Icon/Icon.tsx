import type { FC } from 'react';

import type { IconType } from './types';
import {
    AppSwitcherAgent,
    AppSwitcherAdmin,
    AppSwitcherAnalytics,
    AppSwitcherRingSense,
    AppSwitcherWemEnterprise,
} from '../../../../icons';
import { AppSwitcherIcons } from '../../constants';

const Icon: FC<IconType> = ({ icon }) => {
    switch (icon) {
        case AppSwitcherIcons.AGENT:
            return <AppSwitcherAgent />;
        case AppSwitcherIcons.ANALYTICS:
            return <AppSwitcherAnalytics />;
        case AppSwitcherIcons.ADMIN:
            return <AppSwitcherAdmin />;
        case AppSwitcherIcons.WEM_ENTERPRISE:
            return <AppSwitcherWemEnterprise />;
        case AppSwitcherIcons.RING_SENSE:
            return <AppSwitcherRingSense />;
        default:
            return null;
    }
};

export default Icon;
