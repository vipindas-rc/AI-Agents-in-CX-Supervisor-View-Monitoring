export interface MatchItem {
    id?: string;
    name: string;
    type?: string;
    url?: Nullable<string>;
    icon?: string;
    SvgIcon?: React.ComponentType;
    isCurrent?: boolean;
    isSearchedResult?: boolean;
    work_phone_number?: string;
    primary_email?: string;
    phone?: string;
    email?: string;
}
