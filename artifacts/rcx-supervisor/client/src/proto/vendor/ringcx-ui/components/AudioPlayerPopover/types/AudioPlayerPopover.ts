import type { ChangeEvent, ReactNode } from 'react';

export interface IAudioPlayerPopover {
    toggleComponent: ReactNode;
    audioSrc: string;
}

export interface IAudioTime {
    current: number;
    total: number;
}

export interface IAudioSlider {
    progressPercent: number;
    onSeek: (event: ChangeEvent<unknown>, value: number | number[]) => void;
    onSeekCommitted: () => void;
    isLoading: boolean;
}

export interface IReducerAction {
    type: string;
    newVal?: number;
}
