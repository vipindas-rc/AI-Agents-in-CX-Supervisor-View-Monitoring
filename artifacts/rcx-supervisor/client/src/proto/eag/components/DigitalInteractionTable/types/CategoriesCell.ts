import type { TagColor } from '@ringcx/ui';

export type Category = {
    id: string;
    code: string;
    groupId: string;
    name: string;
    color: TagColor;
    isPriority: boolean;
};

export type Categories = Category[];
