import {
    IncomingCallMd,
    OutgoingCallMd,
    AppleMessagesMd,
    EmailMd,
    Sdkmd,
    FacebookMd,
    GoogleMyBusinessMd,
    GooglePlayMd,
    Smsmd,
    InstagramMd,
    InstagramMessagingMd,
    LinkedInMd,
    FacebookMessengerMd,
    RightNowMd,
    TapatalkMd,
    WhatsAppMd,
    XTwitterMd,
    XTwitterSearchMd,
    ViberMd,
    YoutubeMd,
    KhorosMd,
    InboxMd,
    MsTeams,
} from '@ringcentral/spring-icon';

import type { ChannelConfig } from './types';
import { ChannelType } from '../../../common/services/transport';
import translate from '../../../helpers/translate';

export const CHANNEL_CONFIG: ChannelConfig = {
    [ChannelType.Voice]: {
        symbol: IncomingCallMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.VOICE_INBOUND');
        },
    },
    [ChannelType.InboundVoice]: {
        symbol: IncomingCallMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.VOICE_INBOUND');
        },
    },
    [ChannelType.OutboundVoice]: {
        symbol: OutgoingCallMd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.VOICE_OUTBOUND'
            );
        },
    },
    [ChannelType.AppleBusinessChat]: {
        symbol: AppleMessagesMd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.APPLE_MESSAGES_FOR_BUSINESS'
            );
        },
    },
    [ChannelType.Email]: {
        symbol: EmailMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.EMAIL');
        },
    },
    [ChannelType.ChannelSDK]: {
        symbol: Sdkmd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.ENGAGE_DIGITAL_CHANNEL_SDK'
            );
        },
    },
    [ChannelType.EngageMessaging]: {
        symbol: InboxMd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.ENGAGE_MESSAGING'
            );
        },
    },
    [ChannelType.Facebook]: {
        symbol: FacebookMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.FACEBOOK_PAGE');
        },
    },
    [ChannelType.GoogleMyBusiness]: {
        symbol: GoogleMyBusinessMd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.GOOGLE_MY_BUSINESS'
            );
        },
    },
    [ChannelType.GooglePlay]: {
        symbol: GooglePlayMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.GOOGLE_PLAY');
        },
    },
    [ChannelType.SMS]: {
        symbol: Smsmd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.SMS');
        },
    },
    [ChannelType.Instagram]: {
        symbol: InstagramMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.INSTAGRAM');
        },
    },
    [ChannelType.InstagramMessaging]: {
        symbol: InstagramMessagingMd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.INSTAGRAM_MESSAGING'
            );
        },
    },
    [ChannelType.Lithium]: {
        symbol: KhorosMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.KHOROS');
        },
    },
    [ChannelType.Linkedin]: {
        symbol: LinkedInMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.LINKEDIN');
        },
    },
    [ChannelType.Messenger]: {
        symbol: FacebookMessengerMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.MESSENGER');
        },
    },
    [ChannelType.RightNow]: {
        symbol: RightNowMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.RIGHTNOW');
        },
    },
    [ChannelType.Tapatalk]: {
        symbol: TapatalkMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.TAPATALK');
        },
    },
    [ChannelType.Viber]: {
        symbol: ViberMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.VIBER');
        },
    },
    [ChannelType.WhatsApp]: {
        symbol: WhatsAppMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.WHATSAPP');
        },
    },
    [ChannelType.TwitterSearch]: {
        symbol: XTwitterSearchMd,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.TWITTER_SEARCH'
            );
        },
    },
    [ChannelType.Twitter]: {
        symbol: XTwitterMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.TWITTER');
        },
    },
    [ChannelType.YouTube]: {
        symbol: YoutubeMd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.YOUTUBE');
        },
    },
    [ChannelType.MicrosoftTeams]: {
        symbol: MsTeams,
        get name() {
            return translate(
                'CHAT.INTERACTION_HISTORY.CHANNELS.MICROSOFT_TEAMS'
            );
        },
    },
    [ChannelType.Textel]: {
        symbol: Smsmd,
        get name() {
            return translate('CHAT.INTERACTION_HISTORY.CHANNELS.TEXTEL');
        },
    },
};
