import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { NavGroupsContainer, NavGroupsWrapper } from './NavGroup.styled';
import { isActivationKey } from '../../../../../helpers/keyboard';
import { i18next } from '../../../../../services/translate';
import type { INavGroup, INavGroups } from '../../types';
import { Divider } from '../Divider';
import { NavIconButton } from '../NavIconButton';

export const NavGroups: FC<INavGroups> = ({
    expanded,
    navItems,
    showItemTooltip,
    currentRoute,
    debounceToggle,
    visibleNavGroup,
    displayDividers,
    layout,
}) => {
    const { t } = useTranslation(undefined, { i18n: i18next });

    return (
        <NavGroupsContainer
            layout={layout}
            role='menubar'
            aria-label={t('ARIA_LABELS.MAIN_NAVIGATION')}
        >
            {navItems.map((section: INavGroup, index: number) => {
                const {
                    icon,
                    label,
                    route,
                    children,
                    divider,
                    renderMenuItemComponent,
                    onClick,
                    enableAccessibility,
                } = section;

                const hasChildren = children && children.length > 0;

                return (
                    <NavGroupsWrapper key={index} layout={layout}>
                        {divider && displayDividers ? (
                            <Divider layout={layout} />
                        ) : null}
                        <NavIconButton
                            {...{
                                onMouseEnter: () =>
                                    debounceToggle(true, section),
                                onKeyDown: (
                                    event: React.KeyboardEvent<HTMLDivElement>
                                ) => {
                                    if (
                                        isActivationKey(event.key) &&
                                        enableAccessibility
                                    ) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        debounceToggle(true, section);
                                    }
                                },
                                onClick,
                                onShowTooltip: () => !hasChildren,
                                href: hasChildren ? undefined : route,
                                renderMenuItemComponent,
                                viewing: visibleNavGroup === section,
                                selected:
                                    (route && currentRoute.includes(route)) ||
                                    false,
                                label,
                                icon,
                                expanded,
                                showItemTooltip,
                                badgeContent: section?.unreadCount || undefined,
                                key: index,
                                layout,
                            }}
                        />
                    </NavGroupsWrapper>
                );
            })}
        </NavGroupsContainer>
    );
};
