import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { DateTime } from '@ringcx/shared';

import { TEST_AID } from '../../../constants';
import { AudioTimeStyled } from '../AudioPlayerPopover.styled';
import type { IAudioTime } from '../types/AudioPlayerPopover';

export const AudioTime: FC<IAudioTime> = ({ current = 0, total = 0 }) => {
    const formatTime = (seconds: number) => {
        return DateTime.fromObjectToDateTime({
            hour: 0,
            minute: Math.floor(seconds / 60),
            second: Math.floor(seconds % 60),
        });
    };

    const [currentTime, setCurrentTime] = useState(formatTime(current));
    const totalTime = formatTime(total);

    useEffect(() => {
        setCurrentTime(formatTime(current));
    }, [current]);

    return (
        <AudioTimeStyled data-aid={TEST_AID.AUDIO_PLAYER_TIME}>
            {currentTime.toFormat(' mm:ss ')} / {totalTime.toFormat(' mm:ss ')}
        </AudioTimeStyled>
    );
};
