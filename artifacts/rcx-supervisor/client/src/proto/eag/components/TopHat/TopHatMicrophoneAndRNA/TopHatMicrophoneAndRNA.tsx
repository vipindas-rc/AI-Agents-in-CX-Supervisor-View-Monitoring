import type { FC } from 'react';
import { useState, useEffect } from 'react';

import { Dialog, Button, useOldTopHat } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { MicrophoneAccessInstructions } from './components/MicrophoneAccessInstructions';
import { MICROPHONE_INSTRUCTIONS_OKAY_BUTTON } from '../../../constants/testIds';
import CreateAngularModule from '../../../helpers/CreateAngularModule';
import type { ITopHatMicrophoneAndRNA } from '../types';

export const TopHatMicrophoneAndRNA: FC<ITopHatMicrophoneAndRNA> = ({
    showRnaTophat = false,
    showMicrophoneAccessTophat = false,
    isInCRM = false,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [TopHat] = useState(useOldTopHat());
    const { t } = useTranslation();

    useEffect(() => {
        // Open "RNA" / "Microphone Access" tophat is closed each time useEffect runs and the required
        // tophat is shown based on showRnaTophat and showMicrophoneAccessTophat
        TopHat.closeTopHat();
        if (showRnaTophat) {
            TopHat.warning(t('NOTIFICATION_MESSAGES.RNA'));
        } else if (showMicrophoneAccessTophat) {
            TopHat.warning(
                t('NOTIFICATION_MESSAGES.MICROPHONE_ACCESS_WARNING'),
                {
                    primary: {
                        actionTitle: t('MONITORING.TOOL_TIP.LEARN_MORE'),
                        action: () => {
                            setShowDialog(true);
                        },
                    },
                }
            );
        }
    }, [showRnaTophat, showMicrophoneAccessTophat, TopHat, t]);

    return (
        <Dialog
            fullScreen={isInCRM}
            hideCloseWithX
            open={showDialog}
            content={<MicrophoneAccessInstructions />}
            actions={[
                <Button
                    key='okay'
                    data-aid={MICROPHONE_INSTRUCTIONS_OKAY_BUTTON}
                    onClick={() => setShowDialog(false)}
                >
                    {t('GENERICS.ACTIONS.OKAY')}
                </Button>,
            ]}
            dialogTitle={t('MICROPHONE_ACCESS_INSTRUCTIONS.TITLE')}
        />
    );
};

export default CreateAngularModule(
    'tophatMicrophoneAndRna',
    TopHatMicrophoneAndRNA,
    ['showRnaTophat', 'showMicrophoneAccessTophat', 'isInCRM'],
    [],
    false
);
