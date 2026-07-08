import type { FC } from 'react';
import { memo } from 'react';

import { TextEclipse } from '@ringcx/ui';

import { OverrideText } from './MessageText.styled';
import { useMessageOverride } from '../../hooks';
import type { IChatCard } from '../../types/ChatCard';

type IMessageText = Pick<
    IChatCard,
    'message' | 'pendingAccept' | 'pendingDisp'
>;

export const MessageText: FC<IMessageText> = memo(
    ({ message = '', pendingAccept, pendingDisp }) => {
        const messageOverride = useMessageOverride(pendingAccept, pendingDisp);

        return pendingAccept || pendingDisp ? (
            <OverrideText>{messageOverride}</OverrideText>
        ) : (
            <TextEclipse
                {...{
                    tooltipMsg: message,
                    maxHeight: '20px',
                }}
            >
                {message}
            </TextEclipse>
        );
    }
);
