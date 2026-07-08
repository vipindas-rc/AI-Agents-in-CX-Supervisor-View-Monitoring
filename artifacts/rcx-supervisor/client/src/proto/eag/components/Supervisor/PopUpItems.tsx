import { type FC, useCallback, memo } from 'react';

import { TextEclipse } from '@ringcx/ui';

import { SwitchItems, StatusColor } from './Supervisor.styled';
import type { IPopUpItems } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';

const PopUpItems: FC<IPopUpItems> = ({ data, onClickHandler, tabIndex }) => {
    const { label, color, translatedStateLabel } = data;
    const onSwitchItemClick = useCallback(
        (e: React.MouseEvent<HTMLLIElement>) => {
            onClickHandler(e, data);
        },
        []
    );

    return (
        <SwitchItems
            onClick={onSwitchItemClick}
            disabled={false}
            data-aid={`${SupervisorDataId.AGENT_STATE_DROPDOWN}_${label}`}
            tabIndex={tabIndex}
        >
            <div className='agent-status-list'>
                <StatusColor color={color} />
                <TextEclipse className='agent-status-text' tooltipMsg={label}>
                    {translatedStateLabel || label}
                </TextEclipse>
            </div>
        </SwitchItems>
    );
};

export const PopUpItemsMemoized = memo(PopUpItems);
