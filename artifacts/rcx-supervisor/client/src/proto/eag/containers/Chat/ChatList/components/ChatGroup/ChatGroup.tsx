import type { FC, PropsWithChildren } from 'react';

import { TextEclipse } from '@ringcx/ui';

import { GroupHeader } from './ChatGroup.styled';
import { CHAT_GROUP_TITLE } from '../../../../../constants/testIds';

interface IChatGroup {
    title: string;
}

export const ChatGroup: FC<PropsWithChildren<IChatGroup>> = ({
    title,
    children,
    ...restProps
}) => {
    return (
        <div {...restProps}>
            <GroupHeader>
                <TextEclipse data-aid={CHAT_GROUP_TITLE} tooltipMsg={title}>
                    {title}
                </TextEclipse>
            </GroupHeader>
            {children}
        </div>
    );
};
