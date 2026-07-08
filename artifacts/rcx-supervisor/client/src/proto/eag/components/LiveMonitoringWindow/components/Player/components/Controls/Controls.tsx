import type { FC } from 'react';
import { useState, useEffect } from 'react';

import { CaretLeftMd, CaretRightMd } from '@ringcentral/spring-icon';
import type { IconButtonProps } from '@ringcentral/spring-ui';
import { IconButton } from '@ringcentral/spring-ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { isElectronPlatform } from '../../../../../../helpers/platform';
import { SHOW_CONTROLS_IN_FULLSCREEN_TIMEOUT } from '../../constants';
import { usePlayerContext } from '../../PlayerContext';
import { AudioButton } from '../AudioButton/AudioButton';
import { FullscreenButton } from '../FullscreenButton/FullscreenButton';
import { LocalNetworkQualityIndicator } from '../LocalNetworkQualityIndicator/LocalNetworkQualityIndicator';

export const Controls: FC = () => {
    const { t } = useTranslation();
    const { playerController, rootRef, fullscreen } = usePlayerContext();
    const [showControls, setShowControls] = useState(!fullscreen);

    const prevTitle = t('LIVE_MONITORING.SUPERVISOR.PLAYER.PREV');
    const nextTitle = t('LIVE_MONITORING.SUPERVISOR.PLAYER.NEXT');

    const prevButtonProps: Partial<IconButtonProps> = isElectronPlatform()
        ? {
              TooltipProps: {
                  title: prevTitle,
                  placement: 'top',
                  PopperProps: { disablePortal: true },
              },
          }
        : { title: prevTitle };

    const nextButtonProps: Partial<IconButtonProps> = isElectronPlatform()
        ? {
              TooltipProps: {
                  title: nextTitle,
                  placement: 'top',
                  PopperProps: { disablePortal: true },
              },
          }
        : { title: nextTitle };

    const handlePrevClick = () => {
        playerController.prevVideoTrack();
    };

    const handleNextClick = () => {
        playerController.nextVideoTrack();
    };

    useEffect(() => {
        if (!fullscreen) {
            return;
        }

        let iid: NodeJS.Timeout | undefined;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(iid);
            iid = setTimeout(() => {
                setShowControls(false);
            }, SHOW_CONTROLS_IN_FULLSCREEN_TIMEOUT);
        };

        const controller = new AbortController();
        rootRef.current?.addEventListener('mousemove', handleMouseMove, {
            signal: controller.signal,
        });

        return () => {
            controller.abort();
        };
    }, [rootRef, fullscreen]);

    return (
        <div
            className={clsx(
                'in-fullscreen:absolute in-fullscreen:bottom-6 in-fullscreen:flex in-fullscreen:justify-center w-full transition-opacity duration-300',
                {
                    'in-fullscreen:opacity-0': !showControls,
                    'in-fullscreen:opacity-100': showControls,
                }
            )}
        >
            <div className='in-fullscreen:rounded-lg in-fullscreen:w-[800px] rounded-b-lg bg-gray-200 p-5'>
                <div className='flex items-center rounded-xl bg-white px-4 py-3'>
                    <div className='flex'>
                        <LocalNetworkQualityIndicator />
                    </div>
                    <div className='flex justify-center gap-4'>
                        {/* wrap into divs because tooltip added new nodes near the button and breaks flex layout */}
                        <div>
                            <IconButton
                                {...prevButtonProps}
                                onClick={handlePrevClick}
                                variant='contained'
                                size='medium'
                                color='secondary'
                                symbol={CaretLeftMd}
                                background={true}
                                shape='circular'
                            />
                        </div>
                        <div>
                            <IconButton
                                {...nextButtonProps}
                                onClick={handleNextClick}
                                variant='contained'
                                size='medium'
                                color='secondary'
                                symbol={CaretRightMd}
                                background={true}
                                shape='circular'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-2'>
                        <AudioButton />
                        <FullscreenButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
