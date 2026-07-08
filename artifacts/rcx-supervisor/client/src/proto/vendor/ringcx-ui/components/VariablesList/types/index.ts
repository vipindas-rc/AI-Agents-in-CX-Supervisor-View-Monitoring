import type { ReactNode } from 'react';

import type { i18n } from 'i18next';
import type {
    Control,
    FieldValues,
    Path,
    UseFieldArrayReturn,
} from 'react-hook-form';

import type { RHFControllerRenderWithContent } from '../../../types';

export enum KV {
    KEY = 'key',
    VALUE = 'value',
    NAME = 'name',
}

export type VariableButton = {
    onClick: (index: number) => void;
    icon: ReactNode;
    tooltip?: string;
};

export type Column = {
    id: string;
    content: ReactNode;
    render: RHFControllerRenderWithContent;
};

export type UseKVPairColumns = (
    render?: RHFControllerRenderWithContent,
    i18n?: i18n
) => Column[];

export type VariablesListProps<T extends FieldValues> = {
    columns: Column[];
    buttons: VariableButton[];
    name: Path<FieldValues>;
    fieldsArray: UseFieldArrayReturn<T>;
    dataAids?: {
        row?: string;
        button?: string;
    };
    control?: Control;
    i18n?: i18n;
    labelTextDictionary?: Record<string, string>;
};
