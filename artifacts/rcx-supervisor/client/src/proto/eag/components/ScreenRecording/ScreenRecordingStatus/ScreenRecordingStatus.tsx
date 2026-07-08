import type { FC } from 'react';

import { Icon, Tooltip } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ActiveStatusIcon } from './active.svg';
import { ReactComponent as PausedStatusIcon } from './paused.svg';
import { ScreenRecordingNotificationType } from '../../../common/services/ScreenRecordingService/types';
import { SCREEN_RECORDING_STATUS } from '../../../constants/testIds';
import injector from '../../../helpers/injector';
import { useBehaviorSubject } from '../../../helpers/useBehaviorSubject';

export type ScreenRecordingStatusProps = {
    className?: string;
};

export const ScreenRecordingStatus: FC<ScreenRecordingStatusProps> = ({
    className,
}) => {
    const { t } = useTranslation();

    const ScreenRecordingSvc = injector('ScreenRecordingSvc');

    const notificationType = useBehaviorSubject(
        ScreenRecordingSvc.$notificationType
    );

    const status = useBehaviorSubject(ScreenRecordingSvc.$recordingStatus);

    if (
        notificationType !== ScreenRecordingNotificationType.RealTime ||
        !status
    ) {
        return null;
    }

    const title =
        status === 'active'
            ? t('SCREEN_RECORDING.STATUS.ACTIVE')
            : t('SCREEN_RECORDING.STATUS.PAUSED');

    const symbol = status === 'active' ? ActiveStatusIcon : PausedStatusIcon;

    return (
        <div
            data-sui-theme-scope
            data-aid={SCREEN_RECORDING_STATUS}
            className={className}
        >
            <Tooltip title={title}>
                <Icon symbol={symbol} size='medium' />
            </Tooltip>
        </div>
    );
};
