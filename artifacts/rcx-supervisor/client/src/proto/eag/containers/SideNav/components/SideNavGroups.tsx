import type { FC } from 'react';
import { Fragment } from 'react';

import type { INavGroups, INavGroup } from '@ringcx/ui';
import { Divider, NavIconButton } from '@ringcx/ui';

import { isChatSideNavGroup } from '../helpers/types/isChatSideNavGroup';
import type {
    IChatSideNavGroup,
    ISideNavGroups,
} from '../helpers/types/SideNavGroups';

export const getSideNavGroups = (navItems: ISideNavGroups): FC<INavGroups> => {
    return function sideNavGroups({
        expanded,
        showItemTooltip,
        currentRoute,
        visibleNavGroup,
    }) {
        const sectionMap = (
            section: INavGroup | IChatSideNavGroup,
            index: number
        ) => {
            const { icon, label, route, disabled, divider } = section;

            return disabled ? null : (
                <div key={`${label}_${index}`}>
                    {divider ? <Divider /> : null}
                    <NavIconButton
                        {...{
                            href: route,
                            viewing: visibleNavGroup === section,
                            selected: currentRoute.includes(route || ''),
                            label,
                            icon,
                            expanded,
                            showItemTooltip,
                            badgeContent: isChatSideNavGroup(section)
                                ? section.unreadCount
                                : undefined,
                            key: `${label}_${index}`,
                        }}
                    />
                </div>
            );
        };

        return (
            <Fragment>
                {navItems.digitalSections.map(sectionMap)}
                {navItems.voiceSections.map(sectionMap)}
                {navItems.mainSections.map(sectionMap)}
                {navItems.supervisorSections.map(sectionMap)}
            </Fragment>
        );
    };
};
