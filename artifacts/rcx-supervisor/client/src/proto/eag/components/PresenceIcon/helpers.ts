import type { RcPresenceProps, RcPresenceType } from '@ringcentral/juno';

enum UNIFIED_PRESENCE_STATUS {
    AVAILABLE = 'Available',
    DND = 'DND',
    BUSY = 'Busy',
    Offline = 'Offline',
}

export enum AGENT_PRESENCE_STATUS {
    AVAILABLE = 'available',
    DND = 'DND',
    BUSY = 'busy',
    OFFLINE = 'offline',
}

const PRESENCE_STATUS_MAPPING: {
    [K in UNIFIED_PRESENCE_STATUS]: RcPresenceProps['type'];
} = {
    [UNIFIED_PRESENCE_STATUS.AVAILABLE]: AGENT_PRESENCE_STATUS.AVAILABLE,
    [UNIFIED_PRESENCE_STATUS.DND]: AGENT_PRESENCE_STATUS.DND,
    [UNIFIED_PRESENCE_STATUS.BUSY]: AGENT_PRESENCE_STATUS.BUSY,
    [UNIFIED_PRESENCE_STATUS.Offline]: AGENT_PRESENCE_STATUS.OFFLINE,
};

export const getPresenceType = (value: string): RcPresenceType => {
    return (
        PRESENCE_STATUS_MAPPING[value as UNIFIED_PRESENCE_STATUS] ??
        AGENT_PRESENCE_STATUS.OFFLINE
    );
};
