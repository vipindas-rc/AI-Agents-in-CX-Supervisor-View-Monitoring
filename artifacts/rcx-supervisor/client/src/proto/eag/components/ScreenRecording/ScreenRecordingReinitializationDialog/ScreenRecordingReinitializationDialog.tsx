import { useCallback, type FC } from 'react';

import { Button, Dialog } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import type { IScreenRecordingService } from '../../../common/services/ScreenRecordingService/types';
import CreateAngularModule from '../../../helpers/CreateAngularModule';
import injector from '../../../helpers/injector';
import { useBehaviorSubject } from '../../../helpers/useBehaviorSubject';

export const ScreenRecordingReinitializationDialog: FC = () => {
    const ScreenRecordingSvc = injector(
        'ScreenRecordingSvc'
    ) as IScreenRecordingService;

    const status = useBehaviorSubject(ScreenRecordingSvc.$status);
    const { t } = useTranslation();

    const handleClick = useCallback(async () => {
        ScreenRecordingSvc.$status.next('userConfirmedReInitialization');
    }, [ScreenRecordingSvc]);

    return (
        <Dialog
            open={status === 'awaitingUserConfirmationForReInitialization'}
            hideCloseWithX
            maxWidth='xs'
            dialogTitle={t('SCREEN_RECORDING.REINITIALIZATION_DIALOG.TITLE')}
            content={t('SCREEN_RECORDING.REINITIALIZATION_DIALOG.DESCRIPTION')}
            actions={
                <Button onClick={handleClick}>
                    {t('SCREEN_RECORDING.REINITIALIZATION_DIALOG.BUTTON')}
                </Button>
            }
        />
    );
};

export default CreateAngularModule(
    'screenRecordingReinitializationDialog',
    ScreenRecordingReinitializationDialog
);
