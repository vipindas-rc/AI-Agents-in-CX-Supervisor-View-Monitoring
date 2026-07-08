import type { FC } from 'react';

import { digitalColorMap } from '@ringcx/ui';

import { ACTIVE_INTERACTION_ICON } from '../../../constants/testIds';
import { useMessageTypeIcon } from '../../Chat/ChatList/components/ChatCard/hooks';
import type {
    IChatSourceColor,
    IChatType,
} from '../../Chat/ChatList/components/ChatCard/types/ChatCard';

export const ActiveInteraction: FC<{
    channelType: IChatType;
    sourceColor: IChatSourceColor;
}> = ({ channelType, sourceColor }) => {
    const sourceColorHex = digitalColorMap[sourceColor];
    const typeIcon = useMessageTypeIcon(channelType, sourceColorHex, false);

    return <div data-aid={ACTIVE_INTERACTION_ICON}>{typeIcon}</div>;
};
