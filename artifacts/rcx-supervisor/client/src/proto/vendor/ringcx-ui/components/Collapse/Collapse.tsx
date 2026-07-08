import type { FC } from 'react';
import { memo, useMemo, useState, useCallback } from 'react';

import MuiCollapse from '@material-ui/core/Collapse';

import {
    StyledCollapse,
    StyledCaption,
    StyledSubtitle,
    StyledContent,
    StyledArrow,
} from './Collapse.styled';
import type { ICollapseProps } from './types';

const Collapse: FC<ICollapseProps> = ({
    children,
    caption,
    subtitle,
    expanded = null,
    setExpanded,
}) => {
    const [internalState, setInternalState] = useState<boolean>(false);

    const expandedState = expanded !== null ? expanded : internalState;

    const onClickHandler = useCallback(() => {
        if (expanded !== null && setExpanded) {
            setExpanded(!expandedState);
        } else {
            setInternalState(!internalState);
        }
    }, [expanded, expandedState, internalState, setExpanded]);

    const subtitleSection = useMemo(() => {
        if (subtitle && !expandedState) {
            return <StyledSubtitle>{subtitle}</StyledSubtitle>;
        }

        return null;
    }, [subtitle, expandedState]);

    return (
        <StyledCollapse expanded={expandedState}>
            <StyledCaption onClick={onClickHandler}>
                <StyledArrow />
                {caption}
            </StyledCaption>
            {subtitleSection}
            <MuiCollapse
                {...{
                    in: expandedState,
                    timeout: 0,
                }}
            >
                <StyledContent>{children}</StyledContent>
            </MuiCollapse>
        </StyledCollapse>
    );
};

export default memo(Collapse);
