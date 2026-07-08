import { Fragment, type FC } from 'react';

import { TextEclipse, digitalColorMap } from '@ringcx/ui';

import type { IRollupInteraction } from './rollup';
import { StyledChannelWrapper, StyledCountWrapper } from './rollup.styled';
import { MANUALLY_ADD_CHANNELS } from '../../../helpers/agentChannels';
import translate from '../../../helpers/translate';
import { useMessageTypeIcon } from '../../Chat/ChatList/components/ChatCard/hooks';

export const InteractionRollupRows: FC<{ data: IRollupInteraction }> = ({
    data: { sourceName, sourceType, count, sourceColor },
}) => {
    // @ts-ignore
    const sourceColorHex = digitalColorMap[sourceColor];
    const typeIcon = useMessageTypeIcon(sourceType, sourceColorHex, false);

    MANUALLY_ADD_CHANNELS.forEach((channel) => {
        if (channel.label === sourceType) {
            sourceName = translate(channel.translationPath);
        }
    });

    return Number(`${count}`) ? (
        <Fragment>
            <StyledChannelWrapper role='gridcell'>
                {typeIcon}
                <TextEclipse tooltipMsg={sourceName}>{sourceName}</TextEclipse>
            </StyledChannelWrapper>
            <StyledCountWrapper role='gridcell'>{count}</StyledCountWrapper>
        </Fragment>
    ) : null;
};
