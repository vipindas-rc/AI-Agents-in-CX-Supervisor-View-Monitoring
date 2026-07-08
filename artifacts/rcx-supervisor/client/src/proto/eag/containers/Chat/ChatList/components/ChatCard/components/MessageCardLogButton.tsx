import type { FC, MouseEvent } from 'react';

import { MessageLog, Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import {
    MessageLogStyled,
    MessageLogRedDotStyled,
} from './MessageCardLogButton.styled';
import { CRM_DIGITAL_DETAIL_LOG_BUTTON } from '../../../../../../constants/testIds';
import CreateAngularModule from '../../../../../../helpers/CreateAngularModule';
import injector from '../../../../../../helpers/injector';
import { useLocalUnread } from '../hooks/useLocalUnread';
import type { IMessageCardLogButtonProps } from '../types/MessageCardLogButton';

export const unreadStorageKey = 'messageLogViewedList';

export const MessageCardLogButton: FC<IMessageCardLogButtonProps> = ({
    openMessageLogModal,
    uii,
    crmSvc,
    color = '#939393',
}) => {
    const { t } = useTranslation();
    const { isViewed, addNewUnread } = useLocalUnread(uii, crmSvc);

    const AnalyticsSvc = injector('AnalyticsSvc');
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        AnalyticsSvc.track('RCX_digital_messageLog');
        openMessageLogModal();
        if (!isViewed) {
            addNewUnread(uii, crmSvc);
        }
    };
    return (
        <Tooltip title={t('CHAT.SOURCES.MESSAGE_LOG')}>
            <MessageLogStyled
                data-aid={CRM_DIGITAL_DETAIL_LOG_BUTTON}
                onClick={handleClick}
                aria-label={t('CRM.COMMON.CREATE_MESSAGE_LOG')}
            >
                {!isViewed && (
                    <MessageLogRedDotStyled className='message-log-dot' />
                )}
                <MessageLog style={{ color }} />
            </MessageLogStyled>
        </Tooltip>
    );
};

export default CreateAngularModule(
    'messageCardLogButton',
    MessageCardLogButton,
    ['openMessageLogModal', 'uii', 'color', 'crmSvc'],
    []
);
