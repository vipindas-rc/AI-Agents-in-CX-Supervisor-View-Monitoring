import type { MouseEvent } from 'react';

import type { FlatRef } from '../../../types/FlatRef';
import type { INotificationType } from '../../constants/types';

export type topHatContextValue = [
    FlatRef<ITopHatState>,
    (x: FlatRef<ITopHatState>) => void,
];

export interface IActionButton {
    actionTitle: string;
    external?: boolean;
    action(event?: MouseEvent<HTMLElement>): void;
}

export interface ITopHatOptions extends INotificationType {
    primary?: IActionButton;
    secondary?: IActionButton;
    closeWithX?: ICloseActionButton;
    timeout?: number;
    priority?: number;
}

export interface ITopHatMessage {
    text: string;
    options?: ITopHatOptions;
}

export type ICloseActionButton = Pick<IActionButton, 'action'>;

export interface ITopHatState {
    queue: Record<number, ITopHatMessage[]>;
    current: ITopHatMessage | null;
}

export type BuildNewTopHatFunction = (
    message: string,
    options?: ITopHatOptions
) => void;

export interface ITopHatService {
    push: (message: string, options?: ITopHatOptions) => void;
    pop: () => void;

    get: () => ITopHatState;

    info: (message: string, options?: ITopHatOptions) => void;
    error: (message: string, options?: ITopHatOptions) => void;
    warning: (message: string, options?: ITopHatOptions) => void;
    success: (message: string, options?: ITopHatOptions) => void;
}
