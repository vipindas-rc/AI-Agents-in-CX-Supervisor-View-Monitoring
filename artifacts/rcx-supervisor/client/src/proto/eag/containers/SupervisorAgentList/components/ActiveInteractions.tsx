import type { FC, MouseEvent } from 'react';

import { ActiveInteraction } from './ActiveInteraction';
import { MAX_INTERACTIONS } from '../../../constants/app';
import translate from '../../../helpers/translate';
import {
    StyledActiveInteractions,
    StyledActiveInteractionsWrapper,
} from '../SupervisorAgentList.styled';
import type { IActiveInteraction } from '../types/SupervisorAgentList';

export const ActiveInteractions: FC<{
    activeInteractions: IActiveInteraction[];
    onClickInteraction: (event: MouseEvent) => void;
    isSelfAgent: boolean;
}> = ({ activeInteractions, onClickInteraction, isSelfAgent }) => {
    const totalInteractions = activeInteractions.length;
    if (totalInteractions) {
        const activeInteractionList = activeInteractions
            .slice(0, MAX_INTERACTIONS)
            .map((interaction, index) => {
                return (
                    <ActiveInteraction
                        key={index}
                        {...{
                            channelType: interaction.channelType,
                            sourceColor: interaction.sourceColor,
                        }}
                    />
                );
            });

        return (
            <StyledActiveInteractionsWrapper {...{ isSelfAgent }}>
                <StyledActiveInteractions
                    {...{
                        totalInteractions,
                        onClick: onClickInteraction,
                        toolTip: translate(
                            'MONITORING.TOOL_TIP.ACTIVE_INTERACTION'
                        ),
                    }}
                >
                    {activeInteractionList}
                </StyledActiveInteractions>
            </StyledActiveInteractionsWrapper>
        );
    }
    return <span>—</span>;
};
