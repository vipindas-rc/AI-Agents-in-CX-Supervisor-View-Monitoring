import type { ButtonProps } from '@material-ui/core/Button';

export type ChipSize = 'medium' | 'small';

export interface IChipProps extends Omit<ButtonProps, 'size' | 'loading'> {
    title: string;
    size?: ChipSize;
    dataAid?: string;
    onClick: () => void;
    onClose: () => void;
}

export interface IChipStyled extends Omit<ButtonProps, 'size' | 'loading'> {
    size: ChipSize;
}
