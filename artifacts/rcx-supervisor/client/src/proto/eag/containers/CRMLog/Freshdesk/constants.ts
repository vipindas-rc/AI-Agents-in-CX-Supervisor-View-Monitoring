export enum RecordType {
    User = 'User',
    Ticket = 'Ticket',
}

export const NAME_FIELD = [
    {
        type: RecordType.User,
        labelTranslateKey: 'CRM.FRESHDESK.USER',
    },
];
export const NAME_FIELD_FRESHSERVICE = [
    {
        type: RecordType.User,
        labelTranslateKey: 'CRM.FRESHSERVICE.USER',
    },
];
