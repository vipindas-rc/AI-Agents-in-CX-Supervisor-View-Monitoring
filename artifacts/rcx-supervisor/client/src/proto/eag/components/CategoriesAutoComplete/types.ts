import type { IOption, TagColor } from '@ringcx/ui';

export type TagOption = IOption<{ color: TagColor }>;

export type Category = {
    id: string;
    label: string;
    name: string;
    options: { color: TagColor };
};

export type CategoryGroup = {
    id: string;
    name: string;
    mandatory: boolean;
    multiple: boolean;
    color: TagColor;
    categories: Category[];
};

export type SelectedCategories = Record<string, string[]>;
