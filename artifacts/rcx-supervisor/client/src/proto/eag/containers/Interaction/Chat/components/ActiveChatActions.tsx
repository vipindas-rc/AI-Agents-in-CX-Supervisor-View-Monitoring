import type { FC } from 'react';
import { Fragment } from 'react';

import { TransferCallMd, CheckMd, TrashMd } from '@ringcentral/spring-icon';
import { IconButton } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import type { IChatActions } from '../../../Chat/ChatList/components/ChatCard/components/ChatActions/ChatActions';

export const ActiveChatActions: FC<IChatActions> = ({
    onEnd,
    onTransfer,
    onDiscard,
    isDraft,
}) => {
    const { t } = useTranslation();
    const className = 'text-neutral-b2 hover:text-neutral-b1 transition-none';

    if (isDraft) {
        return (
            <IconButton
                symbol={TrashMd}
                TooltipProps={{ title: t('CHAT.ACTIONS.DISCARD') }}
                label={t('CHAT.ACTIONS.DISCARD')}
                variant='icon'
                size='small'
                className={className}
                onClick={onDiscard}
            />
        );
    }

    return (
        <Fragment>
            <IconButton
                symbol={TransferCallMd}
                TooltipProps={{ title: t('CHAT.ACTIONS.TRANSFER') }}
                label={t('CHAT.ACTIONS.TRANSFER')}
                variant='icon'
                size='small'
                className={className}
                onClick={onTransfer}
            />
            <IconButton
                symbol={CheckMd}
                TooltipProps={{ title: t('CHAT.ACTIONS.END') }}
                label={t('CHAT.ACTIONS.END')}
                variant='icon'
                size='small'
                className={className}
                onClick={onEnd}
            />
        </Fragment>
    );
};
