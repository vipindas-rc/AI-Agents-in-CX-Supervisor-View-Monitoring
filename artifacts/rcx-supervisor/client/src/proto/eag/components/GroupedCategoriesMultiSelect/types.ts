import type { IOption, TagColor } from '@ringcx/ui';

export type CategoryOptions = {
    color: TagColor;
    isHidden?: boolean;
};

export type CategoryOption = IOption<CategoryOptions>;

export type Categories = {
    groupId: string;
    id: string;
    name: string;
    color: TagColor | null;
};

export type CategoryList = {
    active: boolean;
    color: TagColor;
    id: string;
    mandatory: boolean;
    multiple: boolean;
    name: string;
    type: string;
    categories: Categories[];
}[];

export type FormData = {
    categoryIds: string[] | symbol;
};

export type GroupedCategoriesMultiSelectProps = {
    categoryList?: CategoryList;
    selectedCategories?: string[] | null;
    onCategoriesChange: (categoryIds: string[]) => void;
    openLabel: string;
    closeLabel: string;
    ariaLabel?: string;
};
