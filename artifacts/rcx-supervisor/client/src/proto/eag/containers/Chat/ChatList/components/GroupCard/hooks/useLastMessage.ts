import { useMemo } from 'react';

import type { ChatServiceChats } from '../../../../types/ChatSvcChatTypes';
import { isDigitalTask } from '../../../../types/ChatSvcChatTypes';

export const useLastMessage = (chat: ChatServiceChats) =>
    useMemo(
        () => {
            const transcriptLength = chat.transcript.length;
            const emptyTranscript = transcriptLength === 0;

            if (
                emptyTranscript ||
                (isDigitalTask(chat) && !chat.waitingForUser)
            ) {
                return '';
            } else {
                return chat.transcript[transcriptLength - 1].message;
            }
        },
        // eslint-disable-next-line
        [chat.transcript.length]
    ); // chat.transcript.length is needed as dependency to up properly watch the state
