import type { FC, PropsWithChildren } from 'react';

import MenuItemAccordion from './components/MenuItemAccordion/MenuItemAccordion';
import {
    StyledMenuItemLinkWrapper,
    StyledMenuItemLink,
} from './components/MenuItemAccordion/MenuItemAccordion.styled';
import {
    StyledDelimiter,
    StyledLeftMenuContent,
    StyledMenuHeader,
} from './SecondaryMenu.styled';
import type { SecondaryMenuType } from './types';
import {
    isLabelComponent,
    isMenuItemWIthChildren,
    isMenuItemWithNoChildren,
    isDelimiter,
} from './types';
import TextOverflow from '../TextOverflow/TextOverflow';

const SecondaryMenu: FC<PropsWithChildren<SecondaryMenuType>> = ({
    children,
    currentLocation,
    menuItems,
}) => (
    <StyledLeftMenuContent>
        <StyledMenuHeader>
            <TextOverflow>{children}</TextOverflow>
        </StyledMenuHeader>
        {menuItems.map((menuItem, index) => {
            if (isMenuItemWIthChildren(menuItem)) {
                const { id, label } = menuItem;

                return (
                    <MenuItemAccordion
                        key={id}
                        menuSubItems={menuItem.items}
                        currentLocation={currentLocation}
                    >
                        <TextOverflow>{label}</TextOverflow>
                    </MenuItemAccordion>
                );
            }

            if (isMenuItemWithNoChildren(menuItem)) {
                const { id, label } = menuItem;

                if (isLabelComponent(label)) {
                    return (
                        <StyledMenuItemLinkWrapper
                            key={id}
                            isActive={menuItem.url === currentLocation}
                        >
                            {label}
                        </StyledMenuItemLinkWrapper>
                    );
                }

                return (
                    <StyledMenuItemLink
                        key={id}
                        href={menuItem.url}
                        isActive={menuItem.url === currentLocation}
                    >
                        {label}
                    </StyledMenuItemLink>
                );
            }

            if (isDelimiter(menuItem)) {
                return <StyledDelimiter key={index} />;
            }

            return null;
        })}
    </StyledLeftMenuContent>
);

export default SecondaryMenu;
