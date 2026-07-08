import type { FC, PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { StyledInteractiveDots } from './InteractiveDots.styled';
import type { IInteractiveDotsType } from './types';

const InteractiveDots: FC<PropsWithChildren<IInteractiveDotsType>> = ({
    color,
    dotsDimension,
    dotsCount = 3,
}) => {
    const dots = useMemo(
        () => Array.from(Array(dotsCount), (_, i) => <span key={i}></span>),
        [dotsCount]
    );
    return (
        <StyledInteractiveDots color={color} dotsDimension={dotsDimension}>
            {dots}
        </StyledInteractiveDots>
    );
};

export default InteractiveDots;
