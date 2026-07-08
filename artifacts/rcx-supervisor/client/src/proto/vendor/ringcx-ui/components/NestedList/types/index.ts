export interface AnalyticsEventProps {
    currentItemLabel: string;
    parentItemLabel: string;
    level: string;
    currentItemTranslationKey?: string;
    parentItemTranslationKey?: string;
}

export interface ListItem {
    id: string;
    label: string;
    translationKey?: string;
    isSelected?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    withDivider?: boolean;
    subheader?: string;
    subheaderTranslationKey?: string;
    childList?: Nullable<ListItem[]>;
    trackAnalyticsEvent?: (props: AnalyticsEventProps) => void;
}

export interface NestedListProps {
    listItems: ListItem[];
    component?: 'nav' | 'div';
    trackAnalyticsEvent?: (props: AnalyticsEventProps) => void;
}

export interface ChildItemProps {
    itemId: string;
    itemLabel: string;
    selected: boolean;
    itemIcon?: React.ReactNode;
    onClick: (id: string) => void;
}
