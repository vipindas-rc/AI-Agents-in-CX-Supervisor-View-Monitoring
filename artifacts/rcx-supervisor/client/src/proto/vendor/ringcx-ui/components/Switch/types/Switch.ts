import type { ChangeEventHandler } from 'react';

import type { SwitchProps } from '@material-ui/core/Switch';

export interface ISwitchProps extends SwitchProps {
    onChange?: ChangeEventHandler<HTMLInputElement>;
    checked?: boolean;
    inProgress?: boolean;
}
