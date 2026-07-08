export function agentStateColor(state: string) {
    let stateColor;
    switch (state) {
        case 'AVAILABLE':
            stateColor = '#25A73C'; // @accent-emerald
            break;
        case 'PENDING-DISP':
            stateColor = '#C98700'; // @gold
            break;
        case 'AWAY':
            stateColor = '#BDBDBD'; // @gray-500
            break;
        case 'WORKING':
            stateColor = '#F7B500'; // @accent-mango
            break;
        case 'ON-BREAK':
            stateColor = '#BDBDBD'; // @gray-500
            break;
        case 'BREAK-AFTER-CALL':
            stateColor = '#BDBDBD'; // @gray-500
            break;
        case 'LUNCH':
            stateColor = '#BDBDBD'; // @gray-500
            break;
        case 'AUX-UNAVAIL-OFFHOOK':
            stateColor = '#d63e39'; // @brand-danger
            break;
        case 'AUX-UNAVAIL-NO-OFFHOOK':
            stateColor = '#d63e39'; // @brand-danger
            break;
        case 'TRAINING':
            stateColor = '#F7B500'; // @accent-mango
            break;
        case 'ENGAGED':
        case 'PREVIEWING':
            stateColor = '#0B7FD9';
            break;
        case 'TRANSITION':
            stateColor = '#F7B500'; // @accent-mango
            break;
        case 'INACTIVE':
            stateColor = '#616161'; // @gray-700 — AirPro turned off; distinct from human idle grays
            break;
        case 'PENDING-INACTIVE':
        case 'PENDING_INACTIVE':
            stateColor = '#C98700'; // @gold — transitional, draining then inactive
            break;
        default:
            stateColor = '#BDBDBD'; // @gray-500
            break;
    }

    return stateColor;
}

/////////////////
//// We need to iterate over SYSTEM_AGENT_STATES_AND_LABELS and BASE_STATES_AND_LABELS to match both the label and key
//// If we don't find a match (for custom labels), we display the label as it is.
////////////////

// For System Agent States, baseState and label are the same so we don't need a key value pair
export const SYSTEM_AGENT_STATES_AND_LABELS = [
    'LOGIN',
    'AVAILABLE',
    'ENGAGED',
    'PREVIEWING',
    'WORKING',
    'ON-BREAK',
    'AWAY',
    'LUNCH',
    'TRAINING',
    'OFF-LINE',
    'TRANSITION',
    'SUSPECT',
    'RNA-STATE',
    'BREAK-AFTER-CALL',
    'AUX-UNAVAIL-NO-OFFHOOK',
    'AUX-UNAVAIL-OFFHOOK',
    'MONITORING',
    'CHAT-RNA',
    'CHAT-PRESENTED',
    'CHAT-ENGAGED',
    'CHAT-AVAILABLE',
    'MONITORING-CHAT',
    'NONE',
];

export enum BASE_STATES_AND_LABELS {
    'AVAILABLE' = 'Available',
    'ON-BREAK' = 'On Break',
    'AWAY' = 'Away',
    'LUNCH' = 'Lunch',
    'TRAINING' = 'Training',
    'AUX-UNAVAIL-OFFHOOK' = 'Aux - Not Available - Allow Offhook',
    'AUX-UNAVAIL-NO-OFFHOOK' = 'Aux - Not Available - Disconnect Offhook',
    'WORKING' = 'Working',
    'PREVIEWING' = 'Previewing',
}

// States that are determined and added on the FE and added to the filter dropdown for Supervisor Screen
export const MANUALLY_ADD_STATES = [
    {
        label: 'PENDING-DISP',
        translationPath: 'MONITORING.AGENT_STATES.PENDING-DISP',
    },
];
