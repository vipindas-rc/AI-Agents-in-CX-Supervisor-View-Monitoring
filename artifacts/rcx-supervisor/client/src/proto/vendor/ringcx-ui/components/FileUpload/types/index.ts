import type { i18n } from 'i18next';

export type IBaseFileUpload = {
    files: File[];
    onChange?: (file: File[]) => void;
    accept?: string;
    disabled?: boolean;
    selectFileText?: string;
    deleteFileText?: string;
    allowMultipleFiles: boolean;
    maxFiles?: number;
    i18n?: i18n;
};

export type ISingleFileUpload = Omit<
    IBaseFileUpload,
    'files' | 'onChange' | 'allowMultipleFiles' | 'maxFiles'
> & {
    file: Nullable<File>;
    onChange?: (files: Nullable<File>) => void;
};

export type IMultipleFilesUpload = Omit<IBaseFileUpload, 'allowMultipleFiles'>;
