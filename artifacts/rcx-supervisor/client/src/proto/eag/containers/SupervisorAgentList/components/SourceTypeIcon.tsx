import type { FC } from 'react';

import { TextEclipse, digitalColorMap } from '@ringcx/ui';

import { MANUALLY_ADD_CHANNELS } from '../../../helpers/agentChannels';
import translate from '../../../helpers/translate';
import { useMessageTypeIcon } from '../../Chat/ChatList/components/ChatCard/hooks';
import type {
    IChatSourceColor,
    IChatType,
} from '../../Chat/ChatList/components/ChatCard/types/ChatCard';
import { ShowIcon } from '../SupervisorAgentList.styled';

const sourceStyle = { textOverflow: 'ellipsis', overflow: 'hidden' };

export const SourceTypeIcon: FC<{
    channelType: IChatType;
    source: string;
    sourceColor: IChatSourceColor;
    role?: string;
}> = ({ channelType, source, sourceColor, role = 'presentation' }) => {
    const sourceColorHex = digitalColorMap[sourceColor];
    const typeIcon = useMessageTypeIcon(
        channelType,
        sourceColorHex,
        true, // Show tooltip to help identify channel type
        false // Override default: icon is decorative, should not be keyboard focusable
    );

    if (source === '—') {
        return <div style={sourceStyle}>{source}</div>;
    }

    MANUALLY_ADD_CHANNELS.forEach((channel) => {
        if (channel.label === source) {
            source = translate(channel.translationPath);
        }
    });

    return (
        <ShowIcon role={role}>
            <div className='image' aria-hidden={true}>
                {typeIcon}
            </div>
            <div style={sourceStyle}>
                <TextEclipse tooltipMsg={source}>{source}</TextEclipse>
            </div>
        </ShowIcon>
    );
};
