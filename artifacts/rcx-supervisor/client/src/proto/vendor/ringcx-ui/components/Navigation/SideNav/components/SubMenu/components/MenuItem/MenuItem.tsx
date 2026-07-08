import type { FC, PropsWithChildren } from 'react';

import { MenuItemStyled } from './MenuItem.styled';
import type { IStyleMenuItem } from './types/MenuItem';

export const MenuItem: FC<PropsWithChildren<IStyleMenuItem>> = ({
    children,
    ...restProps
}) => {
    return (
        <MenuItemStyled {...restProps} role='menuitem' tabIndex={0}>
            {children}
        </MenuItemStyled>
    );
};
