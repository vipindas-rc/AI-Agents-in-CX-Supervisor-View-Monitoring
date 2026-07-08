import type { Control, FieldValues, Path } from 'react-hook-form';

import type { Column, VariableButton } from '../../../types';

export type VariableRow = {
    name: Path<FieldValues>;
    columns: Column[];
    index: number;
    id: string;
    buttons: VariableButton[];
    control?: Control;
    labelTextDictionary?: Record<string, string>;
};
