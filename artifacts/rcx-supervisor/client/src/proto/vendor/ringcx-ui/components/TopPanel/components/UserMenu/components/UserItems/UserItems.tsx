import type { FC } from 'react';
import { Fragment } from 'react';

import type { IUserItems } from './types/UserItems';
import { isMenuItemComponent, isMenuItemLink } from './types/UserItems';
import { StyledUserMenu, StyledUserMenuItem } from './UserItems.styled';

const UserItems: FC<IUserItems> = ({ items }) => (
    <StyledUserMenu role='none'>
        {items.map((item, index) => {
            if (isMenuItemComponent(item) && !item.component) {
                return null;
            }

            return (
                <StyledUserMenuItem key={`__${index}`} role='menuitem'>
                    <Fragment>
                        {isMenuItemLink(item) && (
                            <a
                                href={item.to}
                                target={item.isExternal ? '_blank' : '_self'}
                                rel='noreferrer noopener'
                                onClick={() => {
                                    item.onClick && item.onClick();
                                }}
                            >
                                {item.title}
                            </a>
                        )}
                        {isMenuItemComponent(item) && item.component}
                    </Fragment>
                </StyledUserMenuItem>
            );
        })}
    </StyledUserMenu>
);

export default UserItems;
