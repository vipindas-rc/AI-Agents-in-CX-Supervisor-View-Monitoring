import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ChatSwitcher: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-chat-switcher'} {...props} />
);
