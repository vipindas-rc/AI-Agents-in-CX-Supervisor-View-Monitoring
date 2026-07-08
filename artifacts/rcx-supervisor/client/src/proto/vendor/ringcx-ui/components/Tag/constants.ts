import { TagColor } from './types';

export const TagColorScheme: Record<
    TagColor,
    {
        background: string;
        text: string;
        border: string;
    }
> = {
    [TagColor.Blue]: {
        background: '#E8EFFC',
        text: '#165CD4',
        border: '#A8C2F0',
    },
    [TagColor.Green]: {
        background: '#E4F4E7',
        text: '#1B7E2D',
        border: '#A8D1AF',
    },
    [TagColor.Turquoise]: {
        background: '#E4F7FA',
        text: '#21736E',
        border: '#A9CFD0',
    },
    [TagColor.Purple]: {
        background: '#F3EEFF',
        text: '#743DFF',
        border: '#CDB9FF',
    },
    [TagColor.Orange]: {
        background: '#FEF0E6',
        text: '#D3720E',
        border: '#F1CAA5',
    },
    [TagColor.Red]: {
        background: '#FDEAE5',
        text: '#C40C05',
        border: '#ECA7AC',
    },
    [TagColor.Grey]: {
        background: '#EFEFF0',
        text: '#757575',
        border: '#D1D1D1',
    },
};
