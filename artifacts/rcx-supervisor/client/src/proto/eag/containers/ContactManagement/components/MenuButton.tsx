import { useState, type MouseEvent, forwardRef } from 'react';

import { OverflowVerticalMd } from '@ringcentral/spring-icon';
import {
    IconButton,
    Menu,
    MenuItem,
    MenuItemText,
    MenuList,
} from '@ringcentral/spring-ui';

import { CONTACT_MANAGEMENT_MENU_BUTTON } from '../../../constants/testIds';
import translate from './../../../helpers/translate';

export type MenuAction = {
    id: string;
    label: string;
    onClick: () => void;
};

export type MenuButtonProps = {
    menuActions: MenuAction[];
};

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
    ({ menuActions }, ref) => {
        const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
        return (
            <div data-aid={CONTACT_MANAGEMENT_MENU_BUTTON}>
                <IconButton
                    ref={ref}
                    aria-label={translate('PHONE.MENU_BUTTON_LABEL.SHOW_MORE')}
                    color='secondary'
                    shape='squircle'
                    size='medium'
                    variant='icon'
                    classes={{
                        root: 'outline-0',
                    }}
                    symbol={OverflowVerticalMd}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        setAnchor((prev) => (prev ? null : e.currentTarget));
                        e.stopPropagation();
                    }}
                />
                <Menu
                    placement='bottom-end'
                    open={Boolean(anchor)}
                    anchorEl={anchor}
                    onClose={() => setAnchor(null)}
                    onClick={(event: MouseEvent) => event.stopPropagation()}
                >
                    <MenuList>
                        {menuActions.map(({ onClick, id, label }) => (
                            <MenuItem onClick={onClick} key={id}>
                                <MenuItemText>{label}</MenuItemText>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </div>
        );
    }
);

MenuButton.displayName = 'MenuButton';
