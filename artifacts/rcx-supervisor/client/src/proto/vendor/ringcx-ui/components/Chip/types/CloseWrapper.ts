import type { ChipSize } from './ChipProps';

export interface ICloseWrapper {
    onClose: () => void;
    disabled: boolean;
    size: ChipSize;
}
