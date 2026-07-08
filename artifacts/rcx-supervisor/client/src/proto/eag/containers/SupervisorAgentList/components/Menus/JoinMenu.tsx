import { useCallback, forwardRef } from 'react';

import { RcIcon } from '@ringcentral/juno';
import { Login } from '@ringcentral/juno-icon';
import { Tooltip } from '@ringcx/ui';

import { StyledIconButton } from './Menus.styled';
import { MONITOR_TYPES } from '../../../../constants/app';
import { getSourceType } from '../../../Chat/TypeIcon';
import type { IMonitorMenuInfo } from '../../types/SupervisorAgentList';

const JoinMenu = forwardRef<
    HTMLButtonElement,
    {
        monitorVoice: (
            agentId: string,
            monitorType: MONITOR_TYPES,
            uii: string,
            sourceType: string
        ) => void;
        agentId: string;
        monitoredAgent: IMonitorMenuInfo;
        interactionSourceType: string;
    }
>(({ monitorVoice, agentId, monitoredAgent, interactionSourceType }, ref) => {
    const { uii } = monitoredAgent;
    const sourceType = getSourceType(interactionSourceType);
    const toolTipText = 'Join conversation';
    const onJoin = useCallback(() => {
        monitorVoice(agentId, MONITOR_TYPES.JOIN, uii, sourceType);
    }, [agentId, sourceType, monitorVoice, uii]);

    return (
        <Tooltip title={toolTipText} placement='left'>
            <StyledIconButton
                {...{
                    ref,
                    onClick: onJoin,
                    'aria-label': toolTipText,
                }}
            >
                <RcIcon size={'medium'} symbol={Login} />
            </StyledIconButton>
        </Tooltip>
    );
});

JoinMenu.displayName = 'JoinMenu';
export default JoinMenu;
