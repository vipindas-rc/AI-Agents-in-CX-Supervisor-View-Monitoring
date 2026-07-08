import {
    useCallback,
    useMemo,
    useState,
    useEffect,
    Fragment,
    useRef,
} from 'react';

import type { RcTheme } from '@ringcentral/juno';
import { PlayMd } from '@ringcentral/spring-icon';
import { Text, Button } from '@ringcentral/spring-ui';
import { copyToClipboard } from '@ringcx/ui';

import { InteractionLink } from './InteractionLink';
import {
    initialize,
    refreshFrame,
} from '../../../../common/services/DigitalIframeService/frameBuilder';
import { FrameTypeMap } from '../../../../common/services/DigitalIframeService/frameBuilder/types';
import { $theme } from '../../../../common/services/jupiter';
import { StyledAudioPlayerPopover } from '../../../../components/DataPairs/DataPairs.styled';
import type { IDataPairs } from '../../../../components/DataPairs/types/DataPairs';
import { ReportCall } from '../../../../components/ReportCall/ReportCall';
import {
    CONTACT_MANAGEMENT_INTERACTION,
    CONTACT_MANAGEMENT_INTERACTION_CONTENT,
    CONTACT_MANAGEMENT_INTERACTION_DIGITAL_CONTENT,
} from '../../../../constants/testIds';
import { overwriteTheme } from '../../../../helpers/initializeTheme';
import injector from '../../../../helpers/injector';
import translate from '../../../../helpers/translate';
import { useBehaviorSubject } from '../../../../helpers/useBehaviorSubject';
import {
    ContactAccordion,
    type ContactAccordionProps,
} from '../../components/ContactAccordion';
import { ContactHeader } from '../../components/ContactHeader';
import { MenuButton, type MenuAction } from '../../components/MenuButton';
import type { PageType } from '../../types';
import { REPORT_INTERACTION_ORIGIN } from '../constants';

type InteractionProps = Pick<ContactAccordionProps, 'defaultExpanded'> & {
    isVoiceChannel: boolean;
    enableCollapse?: boolean;
    NotificationSvc?: {
        showInfo(msg: string): void;
    };
    uii: string;
    isCampaign?: boolean;
    detailInfoData?: Array<IDataPairs>;
    renderPhoneBlock?: () => JSX.Element | null;
    source: string;
    showDigitalIframe?: boolean;
    taskId?: string;
    enableCallQuality?: boolean;
    origin?: string;
    AgentSvc?: any;
    CallSvc?: any;
    section: PageType;
    enableCopyInteractionId?: boolean;
};

export const Interaction = ({
    enableCollapse,
    isVoiceChannel,
    source,
    detailInfoData,
    isCampaign,
    uii,
    showDigitalIframe,
    taskId,
    defaultExpanded,
    origin,
    enableCallQuality = true,
    renderPhoneBlock,
    CallSvc = injector('CallSvc'),
    AgentSvc = injector('AgentSvc'),
    NotificationSvc = injector('NotificationSvc'),
    section,
    enableCopyInteractionId = true,
}: InteractionProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const [isReportModel, setIsReportModel] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(!!defaultExpanded);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const theme: (RcTheme & { themeName?: string }) | undefined =
        useBehaviorSubject($theme);

    const prevThemeRef = useRef(theme);

    const copy = useCallback(async () => {
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            section,
            action: 'more - copy interaction ID',
        });
        if (!uii) return;
        await copyToClipboard(uii);
        NotificationSvc?.showInfo(
            translate('CHAT.INTERACTION.TOAST.ID_COPIED')
        );
    }, [NotificationSvc, uii]);

    const toggleReportCallClick = () => {
        if (!isReportModel) {
            AnalyticsSvc.track('RCX_agent_contactInfo_action', {
                section,
                action: 'more - report call quality',
            });
        }
        setIsReportModel((showModal) => !showModal);
    };

    const renderDetailItem = (dataPair: IDataPairs) => {
        const { label, value } = dataPair;
        if (label === translate('CURRENT_CALL.VOICEMAIL_URL')) {
            return (
                <StyledAudioPlayerPopover
                    audioSrc={value}
                    toggleComponent={
                        <Button
                            variant='text'
                            startIcon={PlayMd}
                            classes={{ root: 'h-full typography-mainText' }}
                        >
                            {translate('GENERICS.LABELS.PLAY_RECORDING')}
                        </Button>
                    }
                />
            );
        }
        if (label === translate('CHAT.INTERACTION.APP_URL')) {
            return <InteractionLink url={value} />;
        }
        if (label === translate('GENERICS.LABELS.PHONE') && renderPhoneBlock) {
            return renderPhoneBlock();
        }
        return value;
    };

    const DataPairList = detailInfoData?.map((dataPair, index) => {
        return (
            <div
                className='flex flex-wrap items-start px-4 py-2'
                key={`${dataPair.label}${index}`}
                data-aid={`${dataPair.label}-info`}
            >
                <Text
                    className='text-neutral-b2 typography-descriptor inline-block w-28'
                    data-aid='label'
                >
                    {dataPair.label}
                </Text>
                <Text
                    className='typography-mainText text-neutral-b0 inline-block flex-1 pl-4'
                    data-aid='value'
                >
                    {renderDetailItem(dataPair)}
                </Text>
            </div>
        );
    });

    const iframeBindingNodeId = `interaction_task_${taskId}`;
    const shouldShowDigitalIframe =
        !isVoiceChannel && showDigitalIframe && taskId;

    const content = shouldShowDigitalIframe ? (
        <div
            className='min-h-[245px] w-full'
            id={iframeBindingNodeId}
            key={iframeBindingNodeId}
            data-aid={CONTACT_MANAGEMENT_INTERACTION_DIGITAL_CONTENT}
        />
    ) : (
        <div
            className='py-2'
            key='voice-content'
            data-aid={CONTACT_MANAGEMENT_INTERACTION_CONTENT}
        >
            {DataPairList}
        </div>
    );

    const title = translate('CHAT.INTERACTION.INTERACTION');

    const sourceLabel = translate(
        isCampaign ? 'CHAT.CHAT_PREVIEW.CAMPAIGN' : 'CHAT.CHAT_PREVIEW.QUEUE'
    );

    const subTitle = source ? `${sourceLabel} ${source}` : '';

    const menuActions: MenuAction[] = useMemo(() => {
        const actions: MenuAction[] = [];

        if (enableCopyInteractionId) {
            actions.push({
                id: 'copyQueueId',
                label: translate('CHAT.INTERACTION.COPY_INTERACTION_ID'),
                onClick: copy,
            });
        }

        if (isVoiceChannel && enableCallQuality) {
            actions.push({
                id: 'reportCall',
                label: translate(
                    'SOFTPHONE.CALL_CONTROL_HELP.REPORT_CALL_QUALITY'
                ),
                onClick: toggleReportCallClick,
            });
        }

        return actions;
    }, [
        copy,
        enableCopyInteractionId,
        enableCallQuality,
        isVoiceChannel,
        toggleReportCallClick,
    ]);

    const handleDataTracking = (isExpanded: boolean) => {
        const action = 'interaction ' + (isExpanded ? 'expand' : 'collapse');
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            section,
            action,
        });
    };

    const accordionView = (
        <ContactAccordion
            ref={menuButtonRef}
            expanded={expanded}
            onChange={(_, value) => setExpanded(value)}
            title={title}
            subTitle={subTitle}
            menuActions={menuActions}
            defaultExpanded={defaultExpanded}
            keepMounted
            expandedBottomBorder
            key={`${uii}-interaction`}
            handleDataTracking={handleDataTracking}
        >
            {content}
        </ContactAccordion>
    );

    const fullView = (
        <Fragment>
            <div className='border-b-neutral-b4-t50 flex h-16 w-full flex-none items-center justify-between border-0 border-b border-solid px-4 text-base font-normal tracking-wider'>
                <ContactHeader title={title} subTitle={subTitle} />
                {!!menuActions?.length && (
                    <MenuButton ref={menuButtonRef} menuActions={menuActions} />
                )}
            </div>
            {content}
        </Fragment>
    );

    useEffect(() => {
        setExpanded(!!defaultExpanded);
    }, [defaultExpanded]);

    useEffect(() => {
        if (!shouldShowDigitalIframe || !expanded) return;
        const queryParamsMap = { task_id: uii };

        const frameBoxElement = document.getElementById(iframeBindingNodeId);
        const hasContent =
            frameBoxElement && frameBoxElement.childElementCount > 0;

        const themeChanged = prevThemeRef.current !== theme;

        if (hasContent && themeChanged) {
            refreshFrame({
                bindingNodeId: iframeBindingNodeId,
                digitalFrameType: FrameTypeMap.INTERACTION,
                agentId: AgentSvc.agentSettings.agentId,
                customQueryParams: queryParamsMap,
                theme: overwriteTheme(theme),
            });
        } else if (!hasContent) {
            initialize({
                bindingNodeId: iframeBindingNodeId,
                digitalFrameType: FrameTypeMap.INTERACTION,
                agentId: AgentSvc.agentSettings.agentId,
                queryParamsMap,
                theme: overwriteTheme(theme),
            });
        }
        prevThemeRef.current = theme;
    }, [
        AgentSvc.agentSettings.agentId,
        expanded,
        shouldShowDigitalIframe,
        iframeBindingNodeId,
        uii,
        theme,
    ]);

    return (
        <div data-aid={CONTACT_MANAGEMENT_INTERACTION} className='w-full'>
            {isVoiceChannel && enableCallQuality && (
                <ReportCall
                    uii={uii}
                    enableReportModal={isReportModel}
                    closeReportModal={toggleReportCallClick}
                    listReportType={AgentSvc.reportIssueTypes}
                    postReportCall={CallSvc.postReportCall}
                    origin={origin ?? REPORT_INTERACTION_ORIGIN}
                    returnFocusRef={menuButtonRef}
                />
            )}
            {enableCollapse ? accordionView : fullView}
        </div>
    );
};
