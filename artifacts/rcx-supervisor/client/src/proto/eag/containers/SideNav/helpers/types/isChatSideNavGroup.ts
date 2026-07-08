import type { INavGroup } from '@ringcx/ui';

import type { IChatSideNavGroup } from './SideNavGroups';

export function isChatSideNavGroup(
    section: IChatSideNavGroup | INavGroup
): section is IChatSideNavGroup {
    return (section as IChatSideNavGroup).unreadCount !== undefined;
}
