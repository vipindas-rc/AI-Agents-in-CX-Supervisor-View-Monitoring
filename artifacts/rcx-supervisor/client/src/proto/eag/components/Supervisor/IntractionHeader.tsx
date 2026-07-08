import { type FC } from 'react';

import { LeftChevron } from '@ringcx/ui';

import { InteractionHeaderContainor } from './Supervisor.styled';
import type { IInteractionHeader } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const InteractionHeader: FC<IInteractionHeader> = ({
    onBackClick,
    engagedAgent,
}) => {
    return (
        <InteractionHeaderContainor id='supervisee-interaction-header'>
            <LeftChevron
                onClick={onBackClick}
                data-aid={SupervisorDataId.CHAT_BACK}
            />
            <div>
                <span>{engagedAgent?.threadTitle}</span>
                <span>{engagedAgent?.productName}</span>
            </div>
        </InteractionHeaderContainor>
    );
};

export default CreateAngularModule(
    'interactionHeader',
    InteractionHeader,
    ['onBackClick', 'engagedAgent'],
    []
);
