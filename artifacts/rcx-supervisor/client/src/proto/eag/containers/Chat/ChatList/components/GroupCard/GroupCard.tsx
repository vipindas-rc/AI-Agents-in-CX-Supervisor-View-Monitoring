import type { FC, SyntheticEvent } from 'react';
import { useState, useMemo, useCallback, Fragment } from 'react';

import { unescapeEntities } from '@ringcx/shared';

import { StyledGroupCard } from './GroupCard.styled';
import { useLastMessage } from './hooks/useLastMessage';
import type { IGroupCard } from './types/GroupCard';
import { CRMPlatform } from '../../../../../constants/crm';
import injector from '../../../../../helpers/injector';
import translate from '../../../../../helpers/translate';
import { EndChatModal } from '../../../../../layout/Modals/EndChatModal';
import { MessageLogModal } from '../../../../../layout/Modals/MessageLogModal';
import type { CRMLogInfo } from '../../../../../layout/Modals/MessageLogModal/types';
import {
    isWebChat,
    isDigitalTask,
    isOutboundDraftChat,
} from '../../../types/ChatSvcChatTypes';
import type { DigitalTask } from '../../../types/DigitalTask';
import type { WebChat } from '../../../types/WebChat';
import { formatPhoneNumber } from '../../helpers';

export const GroupCard: FC<IGroupCard> = ({
    chat,
    selectedUii,
    openChat,
    agentEndChat,
    onAccept,
    onEditDisposition,
    onEnd,
    onReject,
    onTransfer,
    onDiscard,
    isInCRM,
    CrmSvc,
    notificationSvc,
    growl,
    renderCard,
    ...restProps
}) => {
    const [endChatModalOpen, setEndChatModalOpen] = useState(false);
    const [messageLogModalOpen, setMessageLogModalOpen] = useState(false);

    const lastMessage = useLastMessage(chat);

    const messageMatchedRecord = CrmSvc?.messageMatchedRecords[chat.uii];

    const AnalyticsSvc = injector('AnalyticsSvc');

    const setCRMLogInfo = useCallback(
        (info: CRMLogInfo) => {
            CrmSvc.setCRMLogInfo(info, chat.uii);
        },
        [CrmSvc, chat.uii]
    );

    const cardTitle = useMemo<string>(() => {
        let result = '';
        if (isInCRM) {
            result = CrmSvc?.getCRMMessageMatchedName(messageMatchedRecord);
            if (isDigitalTask(chat) && result?.length > 0) {
                chat.identityName = result;
            }
            return result;
        } else {
            const defaultTitle = translate('CHAT.CHAT_PREVIEW.ANONYMOUS');

            if (isWebChat(chat)) {
                if (chat.channelType === 'WEB_CHAT') {
                    result = defaultTitle;
                } else if (chat.channelType === 'SMS') {
                    result = formatPhoneNumber(chat.ani);
                }
            } else if (isDigitalTask(chat)) {
                result = chat.edAuthorScreenName;
            }

            return result || defaultTitle;
        }
    }, [chat, messageMatchedRecord, isInCRM]);

    const crmMatchedInfos = useMemo(() => {
        if (isInCRM) {
            return messageMatchedRecord;
        }
        return null;
    }, [chat, messageMatchedRecord, isInCRM]);

    // typesafe check for pending disp. this doesn't apply for pending chats/tasks
    const pendingDisp =
        (isWebChat(chat) || isDigitalTask(chat)) &&
        chat.inactive &&
        chat.pendingDisp;

    const endChat = () => {
        agentEndChat(chat);
        onEnd(chat as WebChat);
    };

    const onBackIconClick = () => {
        setMessageLogModalOpen(false);
        CrmSvc?.onBackFromMessageLogModal();
    };

    const openMessageLogModal = () => {
        setMessageLogModalOpen(true);
        CrmSvc?.onShowMessageLogModal();
    };

    const cardProps = {
        lastMsgDts: chat.lastMsgDts,
        selected: selectedUii === chat.uii,
        title: cardTitle,
        channelType: chat.channelType,
        message: lastMessage,
        pendingAccept: chat.pending,
        pendingDisp,
        waitingForUser: chat.waitingForUser,
        acceptPromise: chat.acceptPromise,
        agentEndChat: agentEndChat,
        uii: chat.uii,
        taskId: chat.taskId,
        threadTitle: chat.edThreadTitle
            ? unescapeEntities(chat.edThreadTitle)
            : '',
        isDraft: isOutboundDraftChat(chat),
        onClick: () => {
            AnalyticsSvc.track('RCX_digital_openThreading');
            openChat(chat);
        },
        onAccept: (event: SyntheticEvent) => {
            event.stopPropagation();
            onAccept(chat);
        },
        onReject: (event: SyntheticEvent) => {
            event.stopPropagation();
            onReject(chat);
        },
        onEditDisposition: () => onEditDisposition(chat as WebChat),
        onEnd: (event: SyntheticEvent) => {
            event.stopPropagation();
            if (isWebChat(chat)) {
                setEndChatModalOpen(true);
            } else {
                onEnd(chat as DigitalTask);
            }
        },
        onTransfer: (event: SyntheticEvent) => {
            event.stopPropagation();
            onTransfer(chat as WebChat | DigitalTask);
        },
        onDiscard: (event: SyntheticEvent) => {
            event.stopPropagation();
            onDiscard(chat as DigitalTask);
        },
        disabled: chat.pendingAccept || false,
        sourceColor: chat.sourceColor || 0,
        openMessageLogModal,
        isInCRM,
        CrmSvc,
        notificationSvc,
        crmMatchedInfos: crmMatchedInfos,
        ...restProps,
    };

    let card: React.ReactNode = <StyledGroupCard {...cardProps} />;

    if (renderCard) {
        card = renderCard(cardProps);
    }

    return (
        <Fragment>
            <EndChatModal
                open={endChatModalOpen}
                endChat={endChat}
                setOpen={setEndChatModalOpen}
            />
            {card}
            {[
                CRMPlatform.Salesforce,
                CRMPlatform.ServiceNow,
                CRMPlatform.Dynamics365,
                CRMPlatform.HubSpot,
                CRMPlatform.NetSuite,
                CRMPlatform.Zendesk,
                CRMPlatform.Zoho,
            ].includes(CrmSvc?.integrateInfo?.platform) && (
                <MessageLogModal
                    isVisible={
                        messageLogModalOpen && CrmSvc?.showMessageLogModal
                    }
                    CrmSvc={CrmSvc}
                    onBackIconClick={onBackIconClick}
                    chat={chat}
                    growl={growl}
                    CRMLogInfo={messageMatchedRecord?.crmLogInfo}
                    setCRMLogInfo={setCRMLogInfo}
                    onNameChanged={CrmSvc.setCRMMessageMatchedName}
                />
            )}
        </Fragment>
    );
};
