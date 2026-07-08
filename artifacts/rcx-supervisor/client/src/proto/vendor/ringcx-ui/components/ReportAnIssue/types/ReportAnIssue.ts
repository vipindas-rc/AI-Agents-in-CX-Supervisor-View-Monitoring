import type { Dispatch, SetStateAction } from 'react';

import type { ProductType } from '@ringcx/shared';
import type { i18n } from 'i18next';

export type IReportForm = {
    title: string;
    description: string;
    when: string;
    attachments: File[];
};

export const IReportFormFields = {
    TITLE: 'title',
    DESCRIPTION: 'description',
    WHEN: 'when',
    ATTACHMENTS: 'attachments',
    ROOT: 'root',
} as const;

export type ReportAnIssueModalProps = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    issueTitle?: string;
    classNames?: string;
    productType?: ProductType;
    i18n?: i18n;
    onReport: (report: IReportForm) => Promise<void>;
};
