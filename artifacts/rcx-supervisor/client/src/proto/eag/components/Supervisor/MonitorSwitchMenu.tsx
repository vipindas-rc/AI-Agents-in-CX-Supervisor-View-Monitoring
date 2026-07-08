import { type FC, type SyntheticEvent, useCallback, useState } from 'react';

import Menu from '@material-ui/core/Menu';
import type { MenuProps } from '@material-ui/core/Menu';
import { MoreVert } from '@ringcx/ui';

import {
    SwitchMenuContainer,
    SwitchItems,
    MenuButton,
} from './Supervisor.styled';
import type { IMenu, IMenuOptions } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';

const MonitorMenu = (props: MenuProps) => (
    <Menu
        id='monitorMenu'
        getContentAnchorEl={null}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        {...props}
    />
);

export const SwitchMenu: FC<IMenu> = ({ options, shouldHide }) => {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const handleClick = useCallback((event: SyntheticEvent) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback((event: SyntheticEvent) => {
        event.stopPropagation();
        setAnchorEl(null);
    }, []);
    const onClickHandler = (list: IMenuOptions) => {
        if (!list.isDisabled) {
            list.action();
            setAnchorEl(null);
        }
    };
    return (
        <SwitchMenuContainer
            data-aid={SupervisorDataId.MONITOR_CONTAINER}
            shouldHide={shouldHide}
            id='switch-menu-container'
        >
            <MenuButton
                data-aid={SupervisorDataId.MONITOR_MENU_BUTTON}
                onClick={handleClick}
                aria-label='switch menu'
            >
                <MoreVert />
            </MenuButton>
            <MonitorMenu
                {...{
                    anchorEl: anchorEl,
                    keepMounted: true,
                    open: Boolean(anchorEl),
                    onClose: handleClose,
                }}
            >
                {options.map((list) => {
                    return (
                        <SwitchItems
                            key={`option_${list.id}`}
                            disabled={!!list.isDisabled}
                            onClick={() => onClickHandler(list)}
                            className={list.className}
                        >
                            {list.title}
                        </SwitchItems>
                    );
                })}
            </MonitorMenu>
        </SwitchMenuContainer>
    );
};
