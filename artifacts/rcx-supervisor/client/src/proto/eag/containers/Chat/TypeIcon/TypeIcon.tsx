import type { FC, CSSProperties } from 'react';

import { Tooltip as SpringTooltip } from '@ringcentral/spring-ui';
import {
    EngageChat,
    AppleBusinessChat,
    Default,
    EngageCommunitiesAnswers,
    EngageCommunitiesIdeas,
    EngageMessaging,
    EngageDigitalSourceSdk,
    Email,
    FacebookPage,
    GoogleBusinessMessages,
    GoogleMyBusiness,
    GooglePlay,
    Instagram,
    InstagramMessaging,
    Lithium,
    RssFeed,
    Messenger,
    RightNow,
    SmsMms,
    TapaTalk,
    Twitter,
    TwitterSearch,
    Viber,
    WhatsApp,
    YouTube,
    Tooltip,
    Linkedin,
    EmptyStateCallInProgress,
    InboundCallAlt,
    OutboundCallAlt,
    MicrosoftTeams,
    Textel,
    Voicemail,
} from '@ringcx/ui';

import { StyledTypeIcon } from './TypeIcon.styled';
import type { ITypeIcon, TypeIconTooltipVariant } from './types/TypeIcon';
import translate from '../../../helpers/translate';

export const sourceTypeMap = {
    APPLE_BUSINESS_CHAT: <AppleBusinessChat />,
    CHAT: <EngageChat />,
    DEFAULT: <Default />,
    DIMELO_COMMUNITIES_ANSWERS: <EngageCommunitiesAnswers />,
    DIMELO_COMMUNITIES_IDEAS: <EngageCommunitiesIdeas />,
    ENGAGE_MESSAGING: <EngageMessaging />,
    DIMELO_SDK: <EngageDigitalSourceSdk />,
    CHANNEL_SDK: <EngageDigitalSourceSdk />,
    DIGITAL_SMS: <SmsMms />,
    EMAIL: <Email />,
    FACEBOOK: <FacebookPage />,
    GOOGLE_BUSINESS_MESSAGES: <GoogleBusinessMessages />,
    GOOGLE_MY_BUSINESS: <GoogleMyBusiness />,
    GOOGLE_PLAY: <GooglePlay />,
    INSTAGRAM: <Instagram />,
    INSTAGRAM_MESSAGING: <InstagramMessaging />,
    LITHIUM: <Lithium />,
    MESSENGER: <Messenger />,
    RIGHTNOW: <RightNow />,
    RSS: <RssFeed />,
    SMS: <EngageChat />,
    TAPATALK: <TapaTalk />,
    TWITTER: <Twitter />,
    TWITTER_SEARCH: <TwitterSearch />,
    VIBER: <Viber />,
    WEB_CHAT: <EngageChat />,
    WHATS_APP: <WhatsApp />,
    YOUTUBE: <YouTube />,
    LINKEDIN: <Linkedin />,
    VOICE: (
        <EmptyStateCallInProgress
            style={{ fontSize: '12px' } as CSSProperties}
        />
    ),
    VOICE_INBOUND: <InboundCallAlt />,
    VOICE_OUTBOUND: <OutboundCallAlt />,
    LEGACY: <EngageChat />,
    MICROSOFT_TEAMS: <MicrosoftTeams />,
    TEXTEL: <Textel />,
    VOICEMAIL: <Voicemail />,
};

export const getSourceType = (source: string | undefined): string => {
    return source !== undefined && source.toUpperCase() !== 'UNKNOWN'
        ? source.toUpperCase()
        : 'DEFAULT';
};

const wrapWithTooltip = (
    variant: TypeIconTooltipVariant,
    title: string,
    child: JSX.Element
) => {
    if (variant === 'spring') {
        return <SpringTooltip title={title}>{child}</SpringTooltip>;
    }
    return <Tooltip title={title}>{child}</Tooltip>;
};

export const TypeIcon: FC<ITypeIcon> = ({
    inColor,
    source,
    showTip = true,
    tooltipVariant = 'ringcx',
    keyboardFocusable = false,
    className = '',
}) => {
    const uppercaseSource = getSourceType(source) as keyof typeof sourceTypeMap;
    const tooltipTitle = translate(`CHAT.SOURCES.${uppercaseSource}`);

    const iconElement = (
        <StyledTypeIcon
            inColor={inColor}
            role={keyboardFocusable ? 'img' : undefined}
            aria-label={keyboardFocusable ? tooltipTitle : undefined}
            tabIndex={keyboardFocusable ? 0 : undefined}
            className={className}
        >
            {sourceTypeMap[uppercaseSource]}
        </StyledTypeIcon>
    );

    if (showTip) {
        return wrapWithTooltip(tooltipVariant, tooltipTitle, iconElement);
    }

    return iconElement;
};
