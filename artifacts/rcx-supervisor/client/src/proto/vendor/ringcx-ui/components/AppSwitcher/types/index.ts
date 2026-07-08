import type { AppPermissions } from '@ringcx/shared';

import type { AccessibilityLabels } from '../../TopPanel/types/TopPanel';
import type { ListItemType } from '../components/ListItem';

export type IRoutes = {
    [key in keyof AppPermissions]: string;
};

export interface ListItemsWithPermissionType extends ListItemType {
    hasPermission: boolean;
}

export type AppSwitcherProps = {
    labels?: LabelsType;
    loading: boolean;
    rcAccountId: string;
    onTrackAnalytics?: (event: string, property?: any) => void;
    portalType?: number;
    onWEMNotConfigured?: () => void;
    accessibilityLabels?: Partial<AccessibilityLabels>;
};

export type LabelsType = {
    AGENT: string;
    ANALYTICS: string;
    ADMIN: string;
    WEM: string;
    AI: string;
};
