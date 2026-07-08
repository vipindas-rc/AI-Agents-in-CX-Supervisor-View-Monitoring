import type { INavGroup } from '@ringcx/ui';

interface IChatSideNavGroup extends INavGroup {
    unreadCount?: number;
}

export interface ISideNavGroups {
    digitalSections: Array<INavGroup | IChatSideNavGroup>;
    voiceSections: INavGroup[];
    mainSections: INavGroup[];
    supervisorSections: INavGroup[];
    otherSections?: INavGroup[];
}
