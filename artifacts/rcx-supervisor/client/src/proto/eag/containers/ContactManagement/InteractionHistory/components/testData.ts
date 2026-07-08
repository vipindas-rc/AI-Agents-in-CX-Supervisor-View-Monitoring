import type { ActivityLog } from '../../../../common/services/transport';
import { ChannelType } from '../../../../common/services/transport';

const FAKE_DISPOSITION_NAME =
    'This is disposition name. This is disposition name. This is disposition name.This is disposition name. This is disposition name. This is disposition name.';
const FAKE_AUTO_SUMMARY =
    'This is agentSummary name. This is agentSummary name. This is agentSummary name.This is agentSummary name. This is agentSummary name. This is agentSummary name.This is agentSummary name. This is agentSummary name. This is agentSummary name.This is agentSummary name. This is agentSummary name. This is agentSummary name.';
const FAKE_AGENT_NOTES =
    'This is agent note. This is agent note. This is agent note.This is agent note. This is agent note. This is agent note.';
const FAKE_ORIGINAL_AUTO_SUMMARY = 'This is original agentSummary name.';
const FAKE_START_TIME = '2024-03-11T04:06:43Z';
const FAKE_COMPLETION_TIME = '2024-03-11T09:06:43Z';
export const ACTIVITY_LIST: ActivityLog[] = [
    {
        id: '12323',
        channelType: ChannelType.EngageMessaging,
        callType: 'outbound',
        dispositionName: FAKE_DISPOSITION_NAME,
        agentSummary: FAKE_AUTO_SUMMARY,
        agentNotes: FAKE_AGENT_NOTES,
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
        dialogId: '12323',
    },
    {
        id: '123235',
        channelType: ChannelType.Voice,
        callType: 'outbound',
        dispositionName: FAKE_DISPOSITION_NAME,
        agentSummary: FAKE_AUTO_SUMMARY,
        agentNotes: '',
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
    },
    {
        id: '123236',
        channelType: ChannelType.Voice,
        callType: 'inbound',
        dispositionName: '',
        agentSummary: FAKE_AUTO_SUMMARY,
        agentNotes: '',
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
    },
    {
        id: '123237',
        channelType: ChannelType.Twitter,
        dispositionName: FAKE_DISPOSITION_NAME,
        agentSummary: '',
        agentNotes: FAKE_AGENT_NOTES,
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
    },
    {
        id: '123239',
        channelType: ChannelType.GoogleMyBusiness,
        dispositionName: FAKE_DISPOSITION_NAME,
        agentSummary: '',
        agentNotes: '',
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
    },
    {
        id: '123238',
        channelType: ChannelType.OutboundVoice,
        dispositionName: '',
        agentSummary: '',
        agentNotes: '',
        creationTime: FAKE_START_TIME,
        completionTime: '',
    },
    {
        id: '123228',
        channelType: ChannelType.OutboundVoice,
        dispositionName: '',
        agentSummary: '',
        autoSummary: FAKE_ORIGINAL_AUTO_SUMMARY,
        agentNotes: '',
        creationTime: FAKE_START_TIME,
        completionTime: '',
    },
];

export const ALL_CHANNELS_ACTIVITY_LIST = Object.values(ChannelType).map(
    (type, index) => ({
        id: (index + 1).toString(),
        channelType: type,
        dispositionName: FAKE_DISPOSITION_NAME,
        agentSummary: FAKE_AUTO_SUMMARY,
        agentNotes: FAKE_AGENT_NOTES,
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
    })
);

export const ACTIVITY_LIST_100_RECORDS = Array.from(
    { length: 100 },
    (_, index) => ({
        id: index.toString(),
        dialogId: index.toString(),
        channelType: ChannelType.EngageMessaging,
        dispositionName: FAKE_DISPOSITION_NAME,
        agentSummary: FAKE_AUTO_SUMMARY,
        agentNotes: FAKE_AGENT_NOTES,
        creationTime: FAKE_START_TIME,
        completionTime: FAKE_COMPLETION_TIME,
    })
);
