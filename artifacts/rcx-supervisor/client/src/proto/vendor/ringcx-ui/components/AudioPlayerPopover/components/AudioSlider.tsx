import type { FC } from 'react';

import { TEST_AID } from '../../../constants';
import { SliderStyled } from '../AudioPlayerPopover.styled';
import type { IAudioSlider } from '../types/AudioPlayerPopover';

export const AudioSlider: FC<IAudioSlider> = ({
    progressPercent,
    onSeek,
    onSeekCommitted,
    isLoading,
}) => {
    return (
        <SliderStyled
            value={progressPercent}
            min={0}
            max={100}
            step={1}
            onChange={onSeek}
            onChangeCommitted={onSeekCommitted}
            disabled={isLoading}
            data-aid={TEST_AID.AUDIO_PLAYER_SLIDER}
        />
    );
};
