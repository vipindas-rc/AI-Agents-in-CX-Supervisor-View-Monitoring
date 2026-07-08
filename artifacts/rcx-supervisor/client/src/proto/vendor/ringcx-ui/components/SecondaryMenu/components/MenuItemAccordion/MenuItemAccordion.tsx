import type { FC, PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

import {
    StyledAccordion,
    StyledAccordionContainer,
    StyledArrow,
    StyledMenuSubItemLinkWrapper,
    StyledMenuLabel,
    StyledMenuSubItemLink,
} from './MenuItemAccordion.styled';
import type { MenuAccordion } from './types';
import { ArrowDirection } from '../../../../icons/types/Arrow';
import { isLabelComponent } from '../../types';

const MenuItemAccordion: FC<PropsWithChildren<MenuAccordion>> = ({
    children,
    menuSubItems,
    currentLocation,
}) => {
    const [isOpen, setOpen] = useState<boolean>(() =>
        menuSubItems.some(({ url }) => currentLocation === url)
    );

    const onOpenClick = useCallback(() => {
        setOpen(!isOpen);
    }, [isOpen]);

    return (
        <StyledAccordionContainer {...{ isOpen }}>
            <StyledMenuLabel onClick={onOpenClick}>
                {children}
                <StyledArrow
                    direction={
                        isOpen ? ArrowDirection.DOWN : ArrowDirection.RIGHT
                    }
                />
            </StyledMenuLabel>
            <StyledAccordion>
                {menuSubItems.map(({ id, label, url }) =>
                    isLabelComponent(label) ? (
                        <StyledMenuSubItemLinkWrapper
                            key={id}
                            isActive={url === currentLocation}
                        >
                            {label}
                        </StyledMenuSubItemLinkWrapper>
                    ) : (
                        <StyledMenuSubItemLink
                            key={id}
                            href={url}
                            isActive={currentLocation === url}
                        >
                            {label}
                        </StyledMenuSubItemLink>
                    )
                )}
            </StyledAccordion>
        </StyledAccordionContainer>
    );
};
export default MenuItemAccordion;
