import type { ReactNode } from 'react';

import type { CheckboxProps } from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';

export type FormCheckboxProps = ControllerRenderProps &
    CheckboxProps & {
        label: ReactNode;
        tooltipMessage?: string;
        labelCompensation?: boolean;
        margin?: number;
    };
