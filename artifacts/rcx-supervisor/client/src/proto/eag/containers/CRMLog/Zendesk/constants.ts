export enum RecordType {
    User = 'User',
    Ticket = 'Ticket',
}

export const NAME_FIELD = [
    {
        type: RecordType.User,
        labelTranslateKey: 'CRM.ZENDESK.USER',
    },
];

export const TICKET_CACHE_TIME = 1000 * 60 * 5;

export const AUTO_CREATE_TICKET_REASON = 'autoCreateTicket';
