import { useMemo } from 'react';

import { TypeIcon } from '../../../../TypeIcon';
import type { IChatCard } from '../types/ChatCard';

export const useMessageTypeIcon = (
    channelType: IChatCard['channelType'],
    inColor?: string,
    showTip?: boolean,
    keyboardFocusable = true
): JSX.Element =>
    useMemo(() => {
        return (
            <TypeIcon
                {...{
                    inColor,
                    source: channelType,
                    showTip,
                    keyboardFocusable,
                }}
            />
        );
    }, [channelType, inColor, showTip, keyboardFocusable]);
