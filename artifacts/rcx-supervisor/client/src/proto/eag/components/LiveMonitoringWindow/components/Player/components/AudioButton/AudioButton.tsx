import type { FC } from 'react';
import { useCallback } from 'react';

import { VolumeMd, VolumeOffMd } from '@ringcentral/spring-icon';
import { IconButton, type IconButtonProps } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { isElectronPlatform } from '../../../../../../helpers/platform';
import { useBehaviorSubject } from '../../../../../../helpers/useBehaviorSubject';
import { usePlayerContext } from '../../PlayerContext';

export const AudioButton: FC = () => {
    const { t } = useTranslation();
    const { playerController } = usePlayerContext();
    const audioEnabled = useBehaviorSubject(playerController.$audioEnabled);
    const audioAvailable = useBehaviorSubject(playerController.$audioAvailable);

    const title = audioEnabled
        ? t('LIVE_MONITORING.SUPERVISOR.PLAYER.DISABLE_AUDIO')
        : t('LIVE_MONITORING.SUPERVISOR.PLAYER.ENABLE_AUDIO');

    const buttonProps: Partial<IconButtonProps> = isElectronPlatform()
        ? {
              TooltipProps: {
                  title,
                  placement: 'top',
                  PopperProps: { disablePortal: true },
              },
          }
        : { title };

    const symbol = audioEnabled ? VolumeMd : VolumeOffMd;

    const handleChange = useCallback(() => {
        playerController.toggleAudio();
    }, [playerController]);

    return (
        <IconButton
            {...buttonProps}
            onClick={handleChange}
            variant='contained'
            size='medium'
            color='secondary'
            symbol={symbol}
            background={true}
            shape='circular'
            disabled={!audioAvailable && !audioEnabled}
        />
    );
};
