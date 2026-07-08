import { type FC, type MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { RcTypography } from '@ringcentral/juno';
import { CallMd, ComposeMd, NewSmsmd } from '@ringcentral/spring-icon';
import { IconButton, Popover, type IconProps } from '@ringcentral/spring-ui';
import { Session } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import { BigActionButton } from '../../components/BigActionButton/BigActionButton';
import { MAKE_CALL_EVENT } from '../../constants/analyticsEvents';
import {
    INTERACTION_QUICK_ACTION_MAKE_CALL,
    INTERACTION_QUICK_ACTION_NEW_MESSAGE,
    INTERACTION_QUICK_ACTION_NEW_MESSAGE_MENU,
    INTERACTION_QUICK_ACTION_NEW_MESSAGE_OPTION,
    INTERACTION_QUICK_ACTION_NEW_OUTBOUND_SMS,
    INTERACTION_QUICK_ACTIONS,
    INTERACTION_QUICK_ACTIONS_TITLE,
} from '../../constants/testIds';
import { TRACKING_SOURCE } from '../../constants/tracking';

const CLEAR_ICON_CODE_REGEXP = /(^&#x|;)/g;
const HEX_ICON_CODE_REGEXP = /^[\da-f]+$/i;

const getDigitalIconChar = (code: string): string => {
    const iconCode = code.replace(CLEAR_ICON_CODE_REGEXP, '');
    const iconCodePoint = Number.parseInt(iconCode, 16);

    return HEX_ICON_CODE_REGEXP.test(iconCode) &&
        Number.isInteger(iconCodePoint) &&
        iconCodePoint >= 0 &&
        iconCodePoint <= 0x10ffff
        ? String.fromCodePoint(iconCodePoint)
        : '';
};

type InteractionQuickActionsVariant = 'empty' | 'list';
type SpringIconSymbol = NonNullable<IconProps['symbol']>;

interface InteractionQuickActionsProps {
    variant: InteractionQuickActionsVariant;
    AnalyticsSvc: any;
    AgentSvc: any;
    SessionSvc: any;
    chatSvc: any;
    JupiterService: any;
    $rootScope: any;
    AGENT_EVENTS: any;
}

type ChatQueue = {
    chatQueueId?: unknown;
    dnis?: string;
};

type DigitalInitiator = {
    class: string;
    icon_code: string;
    name: string;
};

type DigitalOutboundChannel = {
    id: string;
    icon_code: string;
    initiate_discussion_class: string;
    initiate_discussion_classes?: DigitalInitiator[];
    multiple_initiate_discussion_classes?: boolean;
    name: string;
};

export const InteractionQuickActions: FC<InteractionQuickActionsProps> = ({
    variant,
    AnalyticsSvc,
    AgentSvc,
    SessionSvc,
    chatSvc,
    JupiterService,
    $rootScope,
    AGENT_EVENTS,
}) => {
    const { t } = useTranslation();
    const [, setAgentConfigVersion] = useState(0);

    useEffect(() => {
        const offLogin = $rootScope.$on(AGENT_EVENTS.AGENT_LOGIN, () => {
            setAgentConfigVersion((version) => version + 1);
        });
        const offConfig = $rootScope.$on(AGENT_EVENTS.AGENT_CONFIG, () => {
            setAgentConfigVersion((version) => version + 1);
        });
        return () => {
            offLogin();
            offConfig();
        };
    }, [$rootScope, AGENT_EVENTS]);

    const isInCRM = !!$rootScope.isInCRM?.();
    const isEmptyVoiceQueuesOrDgSelected =
        SessionSvc.isEmptyVoiceQueuesOrDgSelected?.();
    const allowManualCalls = AgentSvc.agentPermissions.allowManualCalls;
    const canMakeCall = allowManualCalls && !isEmptyVoiceQueuesOrDgSelected;
    const setNewCall = canMakeCall ? JupiterService?.setNewCall : null;

    const allowChatOnAgent = AgentSvc.agentPermissions.allowChat;
    const allowChatOnAccount = AgentSvc.agentPermissions.enableChat;
    const allowTaskMode = AgentSvc.isTaskModeEnabled();
    const showMessagesButton =
        (allowChatOnAccount || allowTaskMode) && allowChatOnAgent;
    const showNewMessagesButton =
        showMessagesButton && AgentSvc.agentPermissions.enableTaskMode;

    const loggedInSmsChatQueues = (() => {
        const availableQueues = AgentSvc.getAvailableChatQueues?.() || [];
        const allQueues = Array.isArray(availableQueues) ? availableQueues : [];
        const loginQueues = SessionSvc.getAssignments?.()?.chatQueues || [];

        return allQueues.filter(
            (queue: ChatQueue) =>
                queue.dnis &&
                queue.dnis.length > 0 &&
                loginQueues.indexOf(queue.chatQueueId) > -1
        );
    })();

    const showManualSmsButton =
        allowChatOnAccount && loggedInSmsChatQueues.length > 0 && !isInCRM;

    const [digitalOutboundChannels, setDigitalOutboundChannels] = useState<
        DigitalOutboundChannel[]
    >([]);

    useEffect(() => {
        if (Session.getUserDetails().ssoLogin) {
            chatSvc?.getOutboundChannels?.().catch(window.console.error);
        }
        const sub = chatSvc?.$outboundChannels?.subscribe?.(
            (channels: unknown) => {
                setDigitalOutboundChannels(
                    Array.isArray(channels)
                        ? (channels as DigitalOutboundChannel[])
                        : []
                );
            }
        );
        return () => sub?.unsubscribe?.();
    }, [chatSvc]);

    const onNewCall = useCallback(() => {
        setNewCall?.();
        AnalyticsSvc?.track?.(MAKE_CALL_EVENT);
    }, [AnalyticsSvc, setNewCall]);

    const onManualSms = useCallback(() => {
        chatSvc?.openOutboundSmsModal?.();
    }, [chatSvc]);

    const onManualDigital = useCallback(
        (channelId: string, klass: string) => {
            chatSvc
                ?.openOutboundDigital?.(
                    channelId,
                    klass,
                    TRACKING_SOURCE.MANUAL
                )
                ?.catch?.(window.console.error);
        },
        [chatSvc]
    );

    const isNewMessageButtonEnabled = digitalOutboundChannels.length > 0;
    const isEmptyVariant = variant === 'empty';
    const [messagePopoverAnchor, setMessagePopoverAnchor] =
        useState<HTMLElement | null>(null);
    const isMessagePopoverOpen = Boolean(messagePopoverAnchor);

    const closeMessagePopover = useCallback(() => {
        setMessagePopoverAnchor(null);
    }, []);

    const toggleMessagePopover = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (!isNewMessageButtonEnabled) {
                return;
            }
            const anchorEl = event.currentTarget;

            setMessagePopoverAnchor((anchor) => (anchor ? null : anchorEl));
        },
        [isNewMessageButtonEnabled]
    );

    useEffect(() => {
        if (
            !messagePopoverAnchor ||
            typeof IntersectionObserver === 'undefined'
        ) {
            return undefined;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) {
                closeMessagePopover();
            }
        });
        observer.observe(messagePopoverAnchor);

        return () => {
            observer.disconnect();
        };
    }, [messagePopoverAnchor, closeMessagePopover]);

    const digitalChannelItems = digitalOutboundChannels.flatMap((channel) => {
        if (channel.multiple_initiate_discussion_classes) {
            return (
                channel.initiate_discussion_classes?.map((initiator) => ({
                    channelId: channel.id,
                    iconCode: initiator.icon_code,
                    key: `${channel.id}-${initiator.class}`,
                    klass: initiator.class,
                    name: initiator.name,
                })) ?? []
            );
        }

        return [
            {
                channelId: channel.id,
                iconCode: channel.icon_code,
                key: channel.id,
                klass: channel.initiate_discussion_class,
                name: channel.name,
            },
        ];
    });

    const renderMessagePopover = () => (
        <Popover
            open={isMessagePopoverOpen}
            anchorEl={messagePopoverAnchor}
            placement={isEmptyVariant ? 'right' : 'bottom'}
            onClose={closeMessagePopover}
            disablePortal
            bordered={false}
            shadow={false}
            classes={{
                paper: 'box-border w-50 overflow-hidden rounded-sm border border-solid border-neutral-b0-t20 bg-neutral-base py-2 shadow-md',
            }}
        >
            <div
                role='menu'
                id={`interaction-${variant}-new-message`}
                data-aid={INTERACTION_QUICK_ACTION_NEW_MESSAGE_MENU}
                data-variant={variant}
                className='w-full'
            >
                {digitalChannelItems.map((item) => (
                    <button
                        key={item.key}
                        type='button'
                        role='menuitem'
                        data-aid={INTERACTION_QUICK_ACTION_NEW_MESSAGE_OPTION}
                        data-channel-id={item.channelId}
                        data-channel-class={item.klass}
                        title={item.name}
                        className='hover:bg-neutral-b4-t50 focus-visible:bg-neutral-b4-t50 flex h-10 w-full items-center gap-4 border-0 bg-transparent px-6 text-left'
                        onClick={() => {
                            closeMessagePopover();
                            onManualDigital(item.channelId, item.klass);
                        }}
                    >
                        <span
                            aria-hidden='true'
                            className='text-neutral-b1 h-4 w-4 flex-none text-base leading-4'
                            style={{ fontFamily: 'digital-icons' }}
                        >
                            {getDigitalIconChar(item.iconCode)}
                        </span>
                        <span className='typography-subtitleMini text-neutral-b0 line-clamp-1 min-w-0 flex-1'>
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>
        </Popover>
    );

    const makeCallAction = setNewCall
        ? {
              key: 'call',
              label: t('PHONE.JUPITER.EMPTY_PAGE.CALL_BUTTON'),
              iconSymbol: CallMd,
              testId: INTERACTION_QUICK_ACTION_MAKE_CALL,
              onClick: onNewCall,
          }
        : null;

    const newMessageAction = showNewMessagesButton
        ? {
              key: 'message',
              label: t('CHAT.OUTBOUND.OUTBOUND_DIGITAL'),
              iconSymbol: ComposeMd,
              testId: INTERACTION_QUICK_ACTION_NEW_MESSAGE,
              onClick: toggleMessagePopover,
              disabled: !isNewMessageButtonEnabled,
              ariaHasPopup: isNewMessageButtonEnabled ? 'menu' : undefined,
          }
        : null;

    const smsAction = showManualSmsButton
        ? {
              key: 'sms',
              label: t('CHAT.OUTBOUND.OUTBOUND'),
              iconSymbol: NewSmsmd,
              testId: INTERACTION_QUICK_ACTION_NEW_OUTBOUND_SMS,
              onClick: onManualSms,
          }
        : null;

    const actions = [makeCallAction, newMessageAction, smsAction].filter(
        Boolean
    ) as Array<{
        key: string;
        label: string;
        iconSymbol: SpringIconSymbol;
        testId: string;
        onClick?: (event: MouseEvent<HTMLElement>) => void;
        disabled?: boolean;
        ariaHasPopup?: 'menu';
    }>;

    if (isEmptyVariant && actions.length === 0) {
        return null;
    }

    if (isEmptyVariant) {
        return (
            <div
                data-aid={INTERACTION_QUICK_ACTIONS}
                data-variant={variant}
                data-sui-theme-scope
            >
                <div className='flex flex-wrap justify-center gap-4'>
                    {actions.map((action) => {
                        const StartIcon = action.iconSymbol;
                        return (
                            <BigActionButton
                                key={action.key}
                                data-aid={action.testId}
                                data-variant={variant}
                                title={action.label}
                                onClick={action.onClick}
                                disabled={action.disabled}
                                aria-haspopup={action.ariaHasPopup}
                                aria-expanded={
                                    action.key === 'message'
                                        ? isMessagePopoverOpen
                                        : undefined
                                }
                                aria-controls={
                                    action.key === 'message'
                                        ? `interaction-${variant}-new-message`
                                        : undefined
                                }
                                startIcon={
                                    <StartIcon
                                        aria-hidden='true'
                                        focusable='false'
                                        style={{
                                            display: 'block',
                                            fill: 'currentColor',
                                            flexShrink: 0,
                                            height: 16,
                                            width: 16,
                                        }}
                                    />
                                }
                            >
                                <RcTypography>{action.label}</RcTypography>
                            </BigActionButton>
                        );
                    })}
                </div>
                {renderMessagePopover()}
            </div>
        );
    }

    return (
        <div
            data-aid={INTERACTION_QUICK_ACTIONS}
            data-variant={variant}
            className='border-b-neutral-b0-t10 box-border flex h-[54px] w-full min-w-0 max-w-full items-center border-0 border-b border-solid px-4'
        >
            <div
                data-aid={INTERACTION_QUICK_ACTIONS_TITLE}
                className='typography-subtitle text-neutral-b1 min-w-0 flex-1 truncate'
            >
                {t('INTERACTION.LIST.TITLE')}
            </div>
            <div className='ml-4 flex flex-none items-center gap-4'>
                {actions.map((action) => {
                    const button = (
                        <IconButton
                            key={action.key}
                            symbol={action.iconSymbol}
                            TooltipProps={{ title: action.label }}
                            label={action.label}
                            variant='icon'
                            size='small'
                            data-aid={action.testId}
                            data-variant={variant}
                            className='text-neutral-b1 hover:text-neutral-b1 transition-none'
                            classes={{
                                root: 'h-7 w-7 min-w-7 rounded-full hover:bg-neutral-b4-t50 focus-visible:bg-neutral-b4-t50 disabled:hover:bg-transparent',
                            }}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            aria-haspopup={action.ariaHasPopup}
                            aria-expanded={
                                action.key === 'message'
                                    ? isMessagePopoverOpen
                                    : undefined
                            }
                            aria-controls={
                                action.key === 'message'
                                    ? `interaction-${variant}-new-message`
                                    : undefined
                            }
                        />
                    );

                    return (
                        <div
                            key={action.key}
                            className='flex h-4 w-4 flex-none items-center justify-center'
                        >
                            {button}
                        </div>
                    );
                })}
            </div>
            {renderMessagePopover()}
        </div>
    );
};
