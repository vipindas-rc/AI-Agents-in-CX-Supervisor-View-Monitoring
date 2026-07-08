import type { FC } from 'react';

import { AlertMd } from '@ringcentral/spring-icon';
import { Button, IconButton, Text } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { CHAT_RNA_CARD } from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import type { IChatList } from '../../../../layout/Chat/ChatList/types/ChatList';
import { InteractionCardWrapper } from '../../InteractionCardWrapper';

type MissedMessageCardProps = {
    chatSvc: IChatList['chatSvc'];
};

export const MissedMessageCard: FC<MissedMessageCardProps> = ({ chatSvc }) => {
    const { t } = useTranslation();
    const CHAT_STATES = injector('CHAT_STATES');
    const isChatRNA = chatSvc?.chatState?.currentState === CHAT_STATES.CHAT_RNA;

    const handleClickAccept = () => {
        chatSvc.setChatState(CHAT_STATES.CHAT_AVAILABLE);
    };

    if (!isChatRNA) {
        return null;
    }

    return (
        <InteractionCardWrapper data-aid={CHAT_RNA_CARD} data-interaction-card>
            <div className='flex items-center gap-2'>
                <div className='w-fit'>
                    <IconButton
                        symbol={AlertMd}
                        label={t('CHAT.MODALS.RNA.TITLE')}
                        variant='icon'
                        size='small'
                        color='danger'
                        className='w-4 px-0'
                    />
                </div>
                <div className='min-w-0 flex-1'>
                    <Text className='typography-subtitleMini text-neutral-b1 text-sm'>
                        {t('CHAT.MODALS.RNA.TITLE')}
                    </Text>
                </div>
            </div>
            <div className='space-y-1 pl-6'>
                <div>
                    <Text className='typography-descriptor text-neutral-b2'>
                        {t('CHAT.MODALS.RNA.MSG')}
                    </Text>
                </div>
                <Button
                    variant='text'
                    size='small'
                    className='typography-descriptorMini px-0 text-[12px]'
                    onClick={handleClickAccept}
                >
                    {t('CHAT.MODALS.RNA.ACCEPT_CHATS')}
                </Button>
            </div>
        </InteractionCardWrapper>
    );
};
