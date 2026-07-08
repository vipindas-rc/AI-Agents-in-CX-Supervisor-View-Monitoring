import type { IReducerAction } from '../types/AudioPlayerPopover';

export const AudioPopoverReducer = (
    state: number,
    action: IReducerAction
): number => {
    switch (action.type) {
        case 'increment':
            return state + 1;
        case 'reset':
            return 0;
        case 'set':
            if (action.newVal) {
                return action.newVal;
            }
            return state;
        default:
            return state;
    }
};
