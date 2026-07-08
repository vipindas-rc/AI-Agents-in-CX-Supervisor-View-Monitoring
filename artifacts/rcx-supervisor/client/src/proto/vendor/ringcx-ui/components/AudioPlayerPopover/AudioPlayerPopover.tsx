import type { ChangeEvent, FC } from 'react';
import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';

import { Howl } from 'howler';

import {
    StyledAudioPlayerPopover,
    ToggleBtnStyled,
} from './AudioPlayerPopover.styled';
import { AudioSlider } from './components/AudioSlider';
import { AudioTime } from './components/AudioTime';
import { AudioPopoverReducer } from './reducers/AudioPlayerPopover';
import type { IAudioPlayerPopover } from './types/AudioPlayerPopover';
import { TEST_AID } from '../../constants';
import { Hold, Play } from '../../icons';
import Popover from '../Popover';

const AudioPlayerPopover: FC<IAudioPlayerPopover> = ({
    toggleComponent,
    audioSrc,
    ...rest
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progressPercent, setProgressPercent] = useState(0);
    const playbackInterval = useRef(0);
    const audio = useRef<Howl>();

    const [totalTime, dispatchTotalTime] = useReducer(AudioPopoverReducer, 0);
    const [currentTime, dispatchCurrentTime] = useReducer(
        AudioPopoverReducer,
        0
    );

    const destroyInterval = useCallback(() => {
        clearInterval(playbackInterval.current);
    }, []);

    const play = useCallback(() => {
        if (audio.current) {
            audio.current.play();
        }
    }, [audio]);

    const pause = useCallback(() => {
        destroyInterval();

        if (audio.current) {
            audio.current.pause();
        }
    }, [audio, destroyInterval]);

    const seek = useCallback(
        (event: ChangeEvent<unknown>, value: number | number[]) => {
            pause();
            if (audio.current) {
                const newTime = Math.floor((Number(value) * totalTime) / 100);
                dispatchCurrentTime({ type: 'set', newVal: newTime });
                audio.current.seek(newTime);
            }
        },
        [audio, pause, totalTime]
    );

    const commitSeek = useCallback(() => {
        if (audio && audio.current) {
            play();
        }
    }, [audio, play]);

    const toggleAudio = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [pause, play, isPlaying]);

    const onOpen = () => {
        setIsLoading(true);
        audio.current = new Howl({
            src: [audioSrc],
            format: ['mp3', 'pcm', 'wav'],
            onload: function () {
                setIsLoading(false);
                if (audio.current) {
                    dispatchTotalTime({
                        type: 'set',
                        newVal: audio.current.duration(),
                    });
                }
            },
            onloaderror: function () {
                setIsLoading(false);
            },
            onend: function () {
                setIsPlaying(false);
                dispatchCurrentTime({ type: 'reset' });
                destroyInterval();
            },
            onplay: () => {
                setIsPlaying(true);
                playbackInterval.current = window.setInterval(() => {
                    dispatchCurrentTime({ type: 'increment' });
                }, 1000);
            },
            onpause: () => {
                setIsPlaying(false);
                destroyInterval();
            },
            onseek: () => {
                if (isPlaying) {
                    playbackInterval.current = window.setInterval(() => {
                        dispatchCurrentTime({ type: 'increment' });
                    }, 1000);
                }
            },
        });
    };

    const onClose = useCallback(() => {
        pause();
        dispatchCurrentTime({ type: 'reset' });
    }, [pause]);

    const controlIcon = useMemo(() => {
        return (
            <ToggleBtnStyled
                onClick={toggleAudio}
                disabled={isLoading}
                data-aid={TEST_AID.AUDIO_PLAYER_TOGGLE_BTN}
            >
                {isPlaying ? <Hold /> : <Play />}
            </ToggleBtnStyled>
        );
    }, [isPlaying, isLoading, toggleAudio]);

    useEffect(() => {
        const newPercent = (currentTime / totalTime) * 100;
        setProgressPercent(newPercent);
    }, [currentTime, progressPercent, totalTime]);

    useEffect(() => {
        return () => {
            destroyInterval();
            if (audio.current) {
                audio.current.pause();
            }
        };
    }, [audioSrc, destroyInterval]);

    return (
        <Popover
            {...{
                toggleComponent,
                onClose,
                onOpen,
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                ...rest,
            }}
            data-aid={TEST_AID.AUDIO_PLAYER_POPOVER}
        >
            <StyledAudioPlayerPopover>
                {controlIcon}
                <AudioTime current={currentTime} total={totalTime} />
                <AudioSlider
                    onSeek={seek}
                    onSeekCommitted={commitSeek}
                    progressPercent={progressPercent}
                    isLoading={isLoading}
                />
            </StyledAudioPlayerPopover>
        </Popover>
    );
};

export default AudioPlayerPopover;
