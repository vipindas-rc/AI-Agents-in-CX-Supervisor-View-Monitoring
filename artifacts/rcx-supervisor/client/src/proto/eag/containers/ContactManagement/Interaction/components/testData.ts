export const callDetails = {
    callInfoData: [
        { label: 'State', value: 'ACTIVE' },
        { label: 'DNIŞ', value: '(786) 3691717' },
        { label: 'Call time', value: 'Jul 17, 2023 4:42 PM' },
    ],
    callType: 'OUTBOUND',
    callUii: '202307170712218139930000000052',
    destination: [
        {
            destination: '+16572576281',
            dialable: true,
            disabled: true,
            displayNumber: '(657) 2576281',
        },
    ],
    duration: 0,
    isCampaign: false,
    manualPassAllowed: false,
    name: 'test name',
    source: 'Voice Queue 2',
    manualOutDial: () => {},
    appUrl: '',
};

export const digitalDetails = {
    channelInfoData: [
        { label: 'State', value: 'ACTIVE' },
        { label: 'Start time', value: 'Jul 17, 2023 4:42 PM' },
    ],
    callUii: '202307170712218139930000000052',
    source: 'Digital Queue',
    taskId: '3627382382',
};
export const leadDetails = {
    editLeadDisabled: true,
    leadId: '123',
    list: [],
    editLead: () => {},
};
export const issueList = [
    { id: '1', displayName: 'I do not hear the customer (silence)' },
    { id: '2', displayName: 'The customer does not hear me' },
    { id: '3', displayName: "The customer/'s voice is garbled/choppy" },
    { id: '4', displayName: 'Customer complains my voice is garbled/choppy' },
    { id: '5', displayName: 'Call disconnected unexpectedly' },
    { id: '6', displayName: 'Other (specified in the note)' },
];
