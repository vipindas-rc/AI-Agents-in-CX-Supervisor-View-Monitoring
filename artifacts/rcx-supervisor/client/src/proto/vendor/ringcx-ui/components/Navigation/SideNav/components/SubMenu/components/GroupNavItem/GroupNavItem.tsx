import type { FC } from 'react';

import type { PopperProps } from '@material-ui/core/Popper';

import { SubGroup, SubGroupTitle } from './GroupNavItem.styled';
import { EMPTY_CALLBACK } from '../../../../../../../helpers/usage';
import { TextEclipse } from '../../../../../../TextEclipse';
import TextOverflow from '../../../../../../TextOverflow';
import type {
    INavChild,
    INavOption,
    INavSubGroup,
} from '../../../../types/NavOptions';
import { isMenuItem, isSubGroup, isSubMenu } from '../../SubMenu.helpers';
import { ExpandableNavItem } from '../ExpandableNavItem';
import { MenuItem } from '../MenuItem';

interface IGroupNavItem {
    menuItem: INavSubGroup;
    currentRoute: string;
    popperProps: Partial<PopperProps>;
}

export const GroupNavItem: FC<IGroupNavItem> = ({
    menuItem: { label, children },
    currentRoute,
    popperProps,
}) => (
    <SubGroup>
        <SubGroupTitle>
            <TextOverflow>{label}</TextOverflow>
        </SubGroupTitle>

        {children &&
            children.map((child: INavChild, index: number) => {
                const {
                    disabled,
                    route,
                    label,
                    renderMenuItemComponent: RenderMenuItemComponent,
                } = child as INavOption;

                if (!disabled && isSubMenu(child)) {
                    return (
                        <ExpandableNavItem
                            key={index}
                            {...{
                                currentRoute,
                                menuItem: child,
                                onClick: child.onClick
                                    ? child.onClick
                                    : EMPTY_CALLBACK,
                                popperProps,
                            }}
                        />
                    );
                }

                if (!disabled && isSubGroup(child)) {
                    return (
                        <GroupNavItem
                            key={index}
                            {...{
                                currentRoute,
                                menuItem: child,
                                popperProps,
                            }}
                        />
                    );
                }

                if (!disabled && isMenuItem(child)) {
                    const itemContent = (
                        <TextEclipse
                            tooltipMsg={label}
                            placement={'right'}
                            popperProps={popperProps}
                        >
                            {label}
                        </TextEclipse>
                    );

                    return (
                        <MenuItem
                            key={index}
                            {...{
                                selected:
                                    (route && currentRoute.includes(route)) ||
                                    false,
                                href: route,
                                onClick: child.onClick,
                            }}
                        >
                            {RenderMenuItemComponent ? (
                                <RenderMenuItemComponent>
                                    {itemContent}
                                </RenderMenuItemComponent>
                            ) : (
                                itemContent
                            )}
                        </MenuItem>
                    );
                }

                return null;
            })}
    </SubGroup>
);
