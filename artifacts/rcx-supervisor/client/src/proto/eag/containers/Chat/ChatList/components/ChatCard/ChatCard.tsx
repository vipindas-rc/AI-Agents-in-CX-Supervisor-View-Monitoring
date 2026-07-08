import { useCallback, useEffect, useState, type FC } from 'react';

import { digitalColorMap, TextEclipse } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
    Actions,
    Body,
    Icons,
    Message,
    Notification,
    Row,
    StyledCard,
    Timer,
    Title,
    TypeIconStyled,
} from './ChatCard.styled';
import { CopyThreadIdButton } from './components/CopyThreadIdButton';
import { MessageCardLogButton } from './components/MessageCardLogButton';
import { MessageText } from './components/MessageText';
import {
    useFormattedTime,
    useMessageActions,
    useMessageTypeIcon,
    useNotification,
} from './hooks';
import type { IChatCard } from './types/ChatCard';
import HyperlinkIcon from '../../../../../components/HyperlinkIcon';
import { CRMPlatform } from '../../../../../constants/crm';
import {
    CRM_DIGITAL_MATCHED_TITLE,
    CRM_EMAIL_SUBJECT,
    TIMER,
} from '../../../../../constants/testIds';

const StyledTitleTextEclipse = styled(TextEclipse)`
    flex-shrink: 1;
    min-width: 0;
`;

export const ChatCard: FC<IChatCard> = ({
    selected,
    title,
    lastMsgDts,
    channelType,
    message = '',
    pendingDisp,
    pendingAccept,
    waitingForUser,
    onAccept,
    onReject,
    onEnd,
    onTransfer,
    onEditDisposition,
    onDiscard,
    acceptPromise,
    disabled = false,
    sourceColor,
    isInCRM,
    openMessageLogModal,
    uii,
    taskId,
    isDraft,
    CrmSvc,
    notificationSvc,
    crmMatchedInfos,
    threadTitle,
    ...restProps
}) => {
    const [threadId, setThreadId] = useState<string>('');
    const fetchTaskDetails = useCallback(async () => {
        const result = await CrmSvc?.edApiCall(taskId, 'tasks');
        if (result) {
            setThreadId(result.thread_id ?? '');
        }
    }, [taskId, CrmSvc]);

    useEffect(() => {
        if (taskId && !isDraft) {
            fetchTaskDetails();
        }
    }, [fetchTaskDetails]);

    const formattedTime = useFormattedTime(lastMsgDts);
    const notification = useNotification(
        pendingDisp,
        pendingAccept,
        selected,
        waitingForUser
    );
    const sourceColorHex = digitalColorMap[sourceColor];
    const typeIcon = useMessageTypeIcon(channelType, sourceColorHex);
    const actions = useMessageActions(
        isDraft,
        selected,
        pendingAccept,
        acceptPromise,
        pendingDisp,
        onAccept,
        onReject,
        onEnd,
        onTransfer,
        onEditDisposition,
        onDiscard,
        disabled
    );
    const showModal =
        isInCRM &&
        selected &&
        CrmSvc?.integrateInfo?.platform !== CRMPlatform.Freshdesk &&
        CrmSvc?.integrateInfo?.platform !== CRMPlatform.Freshservice;

    const showCopyThreadId = isInCRM && selected;
    const { t } = useTranslation();
    const isEmail = channelType?.toUpperCase() === 'EMAIL';
    const emailSubject = isInCRM && isEmail ? threadTitle : '';

    return (
        <StyledCard
            {...{
                selected,
                waitingForUser,
                pendingDisp,
                pendingAccept,
                ...restProps,
            }}
        >
            <Body>
                <Row>
                    <Title data-id={CRM_DIGITAL_MATCHED_TITLE}>
                        <StyledTitleTextEclipse {...{ tooltipMsg: title }}>
                            {title}
                        </StyledTitleTextEclipse>
                        <HyperlinkIcon
                            CrmSvc={CrmSvc}
                            title={t(
                                `CRM.${CrmSvc?.integrateInfo?.platform?.toUpperCase()}.VIEW_RECORD` ||
                                    'open_in_crm'
                            )}
                            dataAid={'view_in_crm'}
                            item={{
                                id: crmMatchedInfos?.matchedId,
                                type: crmMatchedInfos?.matchedType,
                                url: crmMatchedInfos?.matchedUrl,
                            }}
                        />
                    </Title>
                    {!pendingDisp && !pendingAccept && (
                        <Timer data-aid={TIMER}>{formattedTime}</Timer>
                    )}
                </Row>
                {emailSubject && (
                    <Row>
                        <StyledTitleTextEclipse
                            data-aid={CRM_EMAIL_SUBJECT}
                            {...{ tooltipMsg: emailSubject }}
                        >
                            {emailSubject}
                        </StyledTitleTextEclipse>
                    </Row>
                )}
                <Row>
                    <Message>
                        <MessageText
                            {...{ message, pendingAccept, pendingDisp }}
                        />
                    </Message>
                    <Notification>{notification}</Notification>
                </Row>
                <Row>
                    <Icons>
                        <TypeIconStyled>{typeIcon}</TypeIconStyled>
                        {showModal && (
                            <MessageCardLogButton
                                openMessageLogModal={openMessageLogModal}
                                uii={uii}
                                crmSvc={CrmSvc}
                            />
                        )}
                        {showCopyThreadId && (
                            <CopyThreadIdButton
                                threadId={threadId}
                                useMenu={false}
                                notificationSvc={notificationSvc}
                            />
                        )}
                    </Icons>
                    <Actions>{actions}</Actions>
                </Row>
            </Body>
        </StyledCard>
    );
};
