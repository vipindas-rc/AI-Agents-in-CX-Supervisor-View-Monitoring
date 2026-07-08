import { type TagColor } from '@ringcx/ui';

export type Category = {
    id: string;
    label: string;
    color: TagColor;
};

export type CategoryPriority = {
    key: string;
    id: string;
    label: string;
};

export type PriorityCategoriesSettings = {
    priorityCategories: Record<string, number>;
    isNotificationEnabled: boolean;
};
