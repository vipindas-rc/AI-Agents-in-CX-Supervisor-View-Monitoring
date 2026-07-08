import { forwardRef } from 'react';

import ListItemText from '@material-ui/core/ListItemText';
import { TextEclipse } from '@ringcx/ui';

import { ListItemCircle, Row, StyledMenuItem } from './State.styled';
import type { IState } from './types/State';

const State = forwardRef<HTMLMenuElement, IState & { tabIndex?: number }>(
    (
        {
            onAgentStateSelect,
            value,
            label,
            translatedStateLabel,
            color,
            tabIndex,
        },
        ref
    ) => {
        return (
            <StyledMenuItem
                innerRef={ref}
                onClick={() => onAgentStateSelect({ value, label, color })}
                tabIndex={tabIndex}
            >
                <Row>
                    <ListItemCircle statusColor={color} />
                    <TextEclipse tooltipMsg={translatedStateLabel || label}>
                        <ListItemText primary={translatedStateLabel || label} />
                    </TextEclipse>
                </Row>
            </StyledMenuItem>
        );
    }
);
State.displayName = 'State';
export default State;
