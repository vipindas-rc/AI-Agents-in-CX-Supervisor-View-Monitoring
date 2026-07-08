export type ProfileFormKeys =
    | 'FirstName'
    | 'LastName'
    | 'Company'
    | 'Gender'
    | 'Email'
    | 'MobilePhones'
    | 'HomePhones'
    | 'TagIds'
    | 'Notes';

export type TagOption = {
    id: string;
    label: string;
};

type FormItem = {
    key: string;
    kind?: string;
    name: string;
    value?: string;
    isIdentifier: boolean;
    [key: string]: any;
};

type FormTagIdsItem = {
    key: string;
    kind: string;
    value: TagOption[];
    name: string;
    isIdentifier: boolean;
    [key: string]: any;
};

type FormItemWithItems = {
    key: string;
    name: string;
    items: {
        kind: string;
        label?: string;
        value: string;
        isIdentifier: boolean;
    }[];
    [key: string]: any;
};

type ProfileFormMapping = {
    TagIds: FormTagIdsItem;
    Email: FormItemWithItems;
    MobilePhones: FormItemWithItems;
    HomePhones: FormItemWithItems;
    FirstName: FormItem;
    LastName: FormItem;
    Company: FormItem;
    Gender: FormItem;
    Notes: FormItem;
};

export type ProfileFormType = {
    [K in ProfileFormKeys]: K extends keyof ProfileFormMapping
        ? ProfileFormMapping[K]
        : FormItem;
};

export type GetContactErrorResponse = {
    errors: {
        message: string;
        errorCode: string;
        raw_error?: {
            emails: string[] | null;
            mobile_phones: string[] | null;
        };
    }[];
};
