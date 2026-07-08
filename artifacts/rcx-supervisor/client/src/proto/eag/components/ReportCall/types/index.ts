export interface IReportCall {
    enableReportModal: boolean;
    uii: string;
    origin: string;
    closeReportModal: () => void;
    listReportType: () => any[];
    postReportCall: (
        uii: string,
        typeOfIssue: string[],
        userNote: string,
        origin: string
    ) => any;
    returnFocusRef?: React.RefObject<HTMLElement>;
}

export type MenuItemTypes = 'item' | 'group';

export interface IFlatMenuItem {
    id: string;
    displayName: string;
}

export type SelectedItemsIds = Array<IFlatMenuItem['id']> | [];
