import { type FC, type MouseEvent } from 'react';

import { Tooltip, CopyAlt as CopyIcon, copyToClipboard } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { StyledIconWrapper, StyledIcon } from './CopyThreadIdButton.styled';
import CreateAngularModule from '../../../../../../helpers/CreateAngularModule';
import type { ICopyThreadIdButtonProps } from '../types/CopyThreadIdButton.types';

export const CopyThreadIdButton: FC<ICopyThreadIdButtonProps> = ({
    threadId,
    notificationSvc,
}) => {
    const { t } = useTranslation();

    const handleCopy = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        copyToClipboard(threadId);
        notificationSvc.showInfo(t('CHAT.MESSAGES.THREAD'));
    };

    const tooltipTitle = t('CHAT.SOURCES.COPY_THREAD_ID');

    return (
        <Tooltip title={tooltipTitle}>
            <StyledIconWrapper onClick={handleCopy}>
                <StyledIcon as={CopyIcon} />
            </StyledIconWrapper>
        </Tooltip>
    );
};

export default CreateAngularModule(
    'copyThreadIdButton',
    CopyThreadIdButton,
    ['taskId', 'useMenu'],
    []
);
