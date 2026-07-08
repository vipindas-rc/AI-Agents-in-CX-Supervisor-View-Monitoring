export enum CallbackMode {
    CURRENT_CALLBACK = 'CURRENT-CALLBACK',
    FUTURE_CALLBACK = 'FUTURE-CALLBACK',
}

export enum LeadClass {
    LEAD_ANSWERED = 'lead-answered',
    LEAD_DIALING = 'lead-dialing',
    LEAD_EXPIRED = 'lead-expired',
}

export enum LeadState {
    ANSWER = 'ANSWER',
    DIALING = 'DIALING',
    RINGING = 'RINGING',
    EXPIRED = 'EXPIRED',
    PENDING = 'PENDING',
}
