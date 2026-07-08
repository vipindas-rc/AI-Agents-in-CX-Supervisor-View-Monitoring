export type IFilterToggle = {
    label?: string;
    count?: number;
    initState?: boolean;
    onToggle?: (isActive: boolean) => void;
};
