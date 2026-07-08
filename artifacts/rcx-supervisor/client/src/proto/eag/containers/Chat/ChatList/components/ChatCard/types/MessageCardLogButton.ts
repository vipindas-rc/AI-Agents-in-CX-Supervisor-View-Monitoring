export interface IMessageCardLogButtonProps {
    openMessageLogModal: () => void;
    uii: string;
    crmSvc?: {
        messageLogViewedList: string[];
        setMessageLogViewedList: (list: string[]) => void;
    };
    color?: string;
}
