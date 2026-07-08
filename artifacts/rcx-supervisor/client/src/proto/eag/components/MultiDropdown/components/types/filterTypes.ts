export type IFilterToggle = {
    label?: string;
    filterCount?: number;
    onToggle?: (isActive: boolean) => void;
    isOpen: boolean;
};
