import type { ReactNode, ChangeEventHandler } from 'react';

import type { RadioProps } from '@material-ui/core/Radio';

export interface IRadioButtonProps extends RadioProps {
    onChange?: ChangeEventHandler<HTMLInputElement>;
    checked?: boolean;
    label?: ReactNode;
}
