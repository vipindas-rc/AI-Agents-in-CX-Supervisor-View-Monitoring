import type { IAccount } from '../../../../AccountPicker';

export interface ILogo {
    mainAccountId?: IAccount['mainAccountId'];
    subAccountId?: IAccount['accountId'];
    onClick?(): void;
    defaultLogo: string;
    withToggle?: boolean;
    alt?: string;
}
