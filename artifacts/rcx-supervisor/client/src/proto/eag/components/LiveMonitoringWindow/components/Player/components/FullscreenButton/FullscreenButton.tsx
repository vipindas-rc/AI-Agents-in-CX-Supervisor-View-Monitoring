import type { FC } from 'react';
import { useEffect, useCallback } from 'react';

import { MaximizeVideoMd, MinimizeVideoMd } from '@ringcentral/spring-icon';
import { IconButton, useWindowContext } from '@ringcentral/spring-ui';
import type { IconButtonProps } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { isElectronPlatform } from '../../../../../../helpers/platform';
import { usePlayerContext } from '../../PlayerContext';

export const FullscreenButton: FC = () => {
    const { rootRef, fullscreen, setFullscreen } = usePlayerContext();
    const document = useWindowContext().document ?? window.document;
    const { t } = useTranslation();

    const fullscreenPredicate = useCallback(
        (): boolean =>
            Boolean(document.fullscreenElement) &&
            document.fullscreenElement === rootRef.current,
        [rootRef, document]
    );

    const handleChange = async () => {
        if (fullscreenPredicate()) {
            await document.exitFullscreen();
            return;
        }
        rootRef.current?.requestFullscreen();
    };

    useEffect(() => {
        const controller = new AbortController();

        document.addEventListener(
            'fullscreenchange',
            () => {
                setFullscreen(fullscreenPredicate());
            },
            { signal: controller.signal }
        );

        return () => controller.abort();
    }, [fullscreenPredicate, setFullscreen, document]);

    const title = fullscreen
        ? t('LIVE_MONITORING.SUPERVISOR.PLAYER.EXIT_FULLSCREEN')
        : t('LIVE_MONITORING.SUPERVISOR.PLAYER.FULLSCREEN');

    const buttonProps: Partial<IconButtonProps> = isElectronPlatform()
        ? {
              TooltipProps: {
                  title,
                  placement: 'top',
                  PopperProps: { disablePortal: true },
              },
          }
        : { title };

    const symbol = fullscreen ? MinimizeVideoMd : MaximizeVideoMd;

    if (!document.fullscreenEnabled) {
        return null;
    }

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
        />
    );
};
