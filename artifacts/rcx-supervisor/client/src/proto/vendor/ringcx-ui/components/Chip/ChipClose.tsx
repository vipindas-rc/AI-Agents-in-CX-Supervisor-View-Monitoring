import type { FC } from 'react';

import type { IChipClose } from './types/ChipClose';

export const ChipClose: FC<IChipClose> = ({ ...props }) => (
    <svg viewBox='0 0 16 16' {...props}>
        <title>Chip close</title>
        <path d='M8,0 C3.576,0 0,3.576 0,8 C0,12.424 3.576,16 8,16 C12.424,16 16,12.424 16,8 C16,3.576 12.424,0 8,0 Z M12,10.872 L10.872,12 L8,9.128 L5.128,12 L4,10.872 L6.872,8 L4,5.128 L5.128,4 L8,6.872 L10.872,4 L12,5.128 L9.128,8 L12,10.872 Z' />
    </svg>
);
