import type { FC, SyntheticEvent } from 'react';

import type { INavMoreButton } from './types/NavMoreButton';
import { More, UpChevron } from '../../../../../icons';
import { NavIconButton } from '../NavIconButton';

export const NavMoreButton: FC<INavMoreButton> = ({
    setShowMore,
    showMore,
    expanded,
    moreLabel = 'More',
    lessLabel = 'Less',
}) => {
    return (
        <NavIconButton
            {...{
                onMouseEnter: (e: SyntheticEvent) => e.preventDefault(),
                onMouseLeave: () => null,
                onClick: () => setShowMore(!showMore),
                viewing: false,
                selected: false,
                showItemTooltip: true,
                label: showMore ? lessLabel : moreLabel,
                icon: showMore ? <UpChevron /> : <More />,
                expanded,
            }}
        />
    );
};
