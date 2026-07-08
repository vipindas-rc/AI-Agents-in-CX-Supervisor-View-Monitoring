export interface IColumnOption {
    id: string;
    visible: boolean;
    disabled?: boolean;
    content?: string;
    displayName?: string;
}
export interface ITableConfigGrid {
    columnOptions: IColumnOption[];
    handleOnDragEnd: (items: IColumnOption[]) => void;
}
