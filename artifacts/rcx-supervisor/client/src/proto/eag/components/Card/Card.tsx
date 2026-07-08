import type { FC } from 'react';

import { CardHover, CardArrow, CardContent } from './Card.styled';
import type { ICard } from './types/Card';
import { CHAT_CARD } from '../../constants/testIds';

export const Card: FC<ICard> = ({
    selected = false,
    children,
    ...restProps
}) => {
    return (
        <CardHover {...{ selected, ...restProps }} data-aid={CHAT_CARD}>
            <CardArrow {...{ selected }}>
                <CardContent>{children}</CardContent>
            </CardArrow>
        </CardHover>
    );
};
