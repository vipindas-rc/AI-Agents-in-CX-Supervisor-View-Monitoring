import type { ReactElement } from 'react';

export interface IGroupMergeLayout {
    components: ReactElement[];
    title: string;
    size: ISize;
    required?: boolean;
    muiVersion?: number;
    dataAid?: string;
}

export type ISize = {
    containerHeight: string;
    inputPadding: string;
    inputPaddingY?: string;
    inputBorderY?: string;
};
