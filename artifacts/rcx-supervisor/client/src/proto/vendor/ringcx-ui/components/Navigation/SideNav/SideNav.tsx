import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useMeasure } from 'react-use';

import { NavGroups } from './components/NavGroups';
import { SubMenu } from './components/SubMenu';
import { renameFn } from './components/SubMenu/SubMenu.helpers';
import { NAV_LAYOUT_VERTICAL } from './constant';
import { StyledNav, StyledNavWrapper } from './SideNav.styled';
import type { ISideNav, VisibleNavGroup } from './types';
import type { INavChild, INavGroup } from './types/NavOptions';
import { TEST_AID } from '../../../constants';
import { More } from '../../../icons';
import { i18next } from '../../../services/translate';

const ICON_HEIGHT = 40;
const HORIZONTAL_ICON_WIDTH = 60;
const ICON_MARGIN = 12;
const DIVIDER_MARGIN = 41;
/*
top margin - 20px
border ------ 1px
bottom margin - 20px

Also seems like margins are not collapsing
*/

/*
AdminJS rename object for example:
    const renames = {
        'Voice priority groups': ['Voice', 'Priority groups'],
        'Digital priority groups': ['Advanced settings', 'Priority groups'],
    };

    Any key, 'Digital priority groups' as example,
    may also contain more than 2 items: ['Digital', 'Advanced settings', 'Priority groups'] - this will also work.

    Key of object is string to apply for the item which position in tree corresponds to value.

    If you specify only one value in route array ['Priority groups'] as example - all entries will be renamed.
 */

export const MORE_MENU_ROUTE = 'base.default.more';

export const SideNav: FC<ISideNav> = ({
    currentRoute,
    expanded,
    navItems,
    showItemTooltip = true,
    navGroupElement: NavGroupElement = NavGroups,
    moreMenuLabel = 'More menu',
    renames,
    layout = 'vertical',
    showSubMenuHeader = true,
}) => {
    const [showSubMenu, setShowSubMenu] = useState<boolean>(false);

    const [visibleNavGroup, setVisibleNavGroup] =
        useState<Nullable<VisibleNavGroup>>(null);

    const selectedNavGroup = useMemo(
        () =>
            navItems.find(
                ({ route }) => route && currentRoute.indexOf(route) > -1
            ),
        [navItems, currentRoute]
    );

    useEffect(() => {
        setShowSubMenu(false);
    }, [currentRoute]);

    const debounceToggle = useCallback(
        (isOpen: boolean, section?: VisibleNavGroup) => {
            const hasChildren =
                section && section.children && section.children.length > 0;
            const isShowSubMenu = !!hasChildren && isOpen;
            setShowSubMenu(isShowSubMenu);

            setVisibleNavGroup(isShowSubMenu ? section : null);
        },
        []
    );

    const onMouseEnter = useCallback(() => {
        let section = selectedNavGroup || visibleNavGroup;
        if (visibleNavGroup && selectedNavGroup) {
            if (visibleNavGroup.label !== selectedNavGroup.label) {
                section = visibleNavGroup;
            }
        }

        debounceToggle(true, section);
    }, [debounceToggle, selectedNavGroup, visibleNavGroup]);

    const nonExtraNavItems = useMemo(() => {
        return navItems.filter((item: INavGroup) => !item.disabled);
    }, [navItems]);

    const [visibleIcons, setVisibleIcons] = useState<INavGroup[]>([]);
    const [slicedIcons, setSlicedIcons] = useState<INavGroup[]>([]);
    const [maxIconsCount, setMaxIconsCount] = useState(0);
    const [newNavItems, setNewNavItems] =
        useState<Array<INavGroup>>(nonExtraNavItems);
    const [isShowMore, setShowMore] = useState(false);
    const [navRef, { height, width }] = useMeasure<HTMLDivElement>();

    const rounding = useMemo(
        () => (isShowMore ? Math.floor : Math.ceil),
        [isShowMore]
    );

    useEffect(() => {
        const maxIconCount = rounding(
            layout === NAV_LAYOUT_VERTICAL
                ? (height - ICON_MARGIN) / (ICON_HEIGHT + ICON_MARGIN)
                : width / HORIZONTAL_ICON_WIDTH
        );

        setMaxIconsCount(maxIconCount);
    }, [height, layout, rounding, width]);

    useEffect(() => {
        const sliceCount = maxIconsCount - 1;

        if (sliceCount > 0) {
            const visibleIcons = nonExtraNavItems.slice(0, sliceCount);
            const slicedIcons = nonExtraNavItems.slice(
                sliceCount,
                nonExtraNavItems.length
            );

            setVisibleIcons(visibleIcons);
            setSlicedIcons(slicedIcons);
        }
    }, [maxIconsCount, nonExtraNavItems]);

    useEffect(() => {
        if (slicedIcons.length > 0) {
            setShowMore(true);

            const moreNavItems = [...visibleIcons];
            const renamedIcons: Array<INavGroup | INavChild> = Object.entries(
                renames || {}
            ).reduce((acc: (INavGroup | INavChild)[], [key, route]) => {
                return renameFn(acc, key, route);
            }, slicedIcons);

            const subItems = renamedIcons.map((item: INavGroup | INavChild) => {
                if ((item as INavGroup).mergeChildren && item.children) {
                    return {
                        ...item,
                        children: (
                            item.children as Array<INavGroup | INavChild>
                        )
                            .map((child: INavChild) => child.children)
                            .reduce((acc, arr) => {
                                if (acc && arr) {
                                    acc = [...acc, ...arr];
                                }
                                return acc;
                            }, []),
                        route: item.label,
                    };
                }

                return item;
            });

            moreNavItems.push({
                label: moreMenuLabel,
                icon: <More />,
                route: MORE_MENU_ROUTE,
                enableAccessibility: true,
                renderMenuItemComponent: ({
                    children,
                }: {
                    children?: ReactNode;
                }) => (
                    <div role='button' tabIndex={0}>
                        {children}
                    </div>
                ),
                children: subItems,
            });

            setNewNavItems(moreNavItems);
        } else {
            setShowMore(false);
            setNewNavItems(visibleIcons);
        }
    }, [visibleIcons, slicedIcons, renames, moreMenuLabel]);

    const dividersCount = useMemo(
        () => nonExtraNavItems.filter((item) => item.divider).length,
        [nonExtraNavItems]
    );
    const maxDividersHeight = useMemo(
        () =>
            nonExtraNavItems.length * (ICON_HEIGHT + ICON_MARGIN) +
            dividersCount * DIVIDER_MARGIN +
            ICON_MARGIN,
        [nonExtraNavItems, dividersCount]
    );

    const displayDividers = useMemo(
        () => height >= maxDividersHeight,
        [height, maxDividersHeight]
    );

    const { t } = useTranslation(undefined, { i18n: i18next });

    return (
        <StyledNavWrapper
            ref={navRef}
            layout={layout}
            data-aid={TEST_AID.SIDE_NAV}
            role='navigation'
            aria-label={t('ARIA_LABELS.MAIN_NAVIGATION')}
        >
            <StyledNav
                {...{
                    expanded,
                    onMouseLeave: () => debounceToggle(true),
                    onMouseEnter,
                    showMore: isShowMore,
                    layout,
                }}
            >
                <NavGroupElement
                    {...{
                        visibleNavGroup,
                        currentRoute,
                        expanded,
                        navItems: newNavItems,
                        showItemTooltip,
                        debounceToggle,
                        displayDividers,
                        layout,
                    }}
                />
                <SubMenu
                    {...{
                        expanded,
                        showSubMenu,
                        currentRoute,
                        visibleNavGroup,
                        isMoreMenu:
                            !!visibleNavGroup &&
                            visibleNavGroup.route === MORE_MENU_ROUTE,
                        layout,
                        showSubMenuHeader,
                    }}
                />
            </StyledNav>
        </StyledNavWrapper>
    );
};
