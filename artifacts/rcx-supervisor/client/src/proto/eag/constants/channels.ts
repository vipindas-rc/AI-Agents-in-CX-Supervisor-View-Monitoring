export const CHANNEL_COLORS = [
    {
        channelType: 'twitter',
        sourceColor: '3',
    },
    {
        channelType: 'WEB_CHAT',
        sourceColor: '2',
    },
    {
        channelType: 'digital_sms',
        sourceColor: '7',
    },
    {
        channelType: 'facebook',
        sourceColor: '1',
    },
    {
        channelType: 'engage_messaging',
        sourceColor: '6',
    },
    {
        channelType: 'twitter',
        sourceColor: '3',
    },
    {
        channelType: 'WEB_CHAT',
        sourceColor: '2',
    },
].reduce(
    (acc, { channelType, sourceColor }) => {
        acc[channelType] = sourceColor;
        return acc;
    },
    {} as Record<string, string>
);
