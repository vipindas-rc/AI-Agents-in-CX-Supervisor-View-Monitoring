import type { FC } from 'react';

import { LinkStyled } from './LinkText.styled';
import type { LinkTextProps } from './types/LinkText';

export const LinkText: FC<LinkTextProps> = ({ children, to, ...props }) => {
    return (
        <LinkStyled href={to} target='_blank' rel='noreferrer' {...props}>
            {children}
        </LinkStyled>
    );
};
