import type { FC } from 'react';
import { useState, useRef } from 'react';

import Icon from '@material-ui/core/Icon';
import { More, Popper, IconButton } from '@ringcx/ui';

import {
    CallDetailsPanelStyled,
    HeaderContent,
    PanelHeader,
    PanelTitle,
    PanelTitleContent,
    OptionStyled,
    StyledLinkButton,
} from './CallDetailsPanel.styled';
import type { ICallDetailsPanel } from './types/CallDetailsPanel';
import { CALL_DETAILS_SECTION } from '../../constants/testIds';
import translate from '../../helpers/translate';
import { isCallPreviewPage } from '../../helpers/utils';
import { CopyID } from '../CopyId/CopyId';
import { ReportCall } from '../ReportCall/ReportCall';

export const CallDetailsPanel: FC<ICallDetailsPanel> = ({
    title,
    headerContent,
    dataPairsContainer,
    callUii,
    confirmationFunction,
    CallSvc,
    AgentSvc,
    originatedFrom,
    className,
    $state,
}) => {
    const [isReportModel, setIsReportModel] = useState(false);
    const [uii, setUii] = useState('');
    const moreButtonRef = useRef<HTMLButtonElement>(null);
    const routeName = $state?.current?.name ?? '';
    const isCallPreviewRef = useRef(isCallPreviewPage(routeName));
    const isCallPreview = isCallPreviewRef.current;

    const toggleReportCallClick = () => {
        if (!isReportModel && callUii) {
            setUii(callUii);
        }
        setIsReportModel(!isReportModel);
    };

    const toggleComponent = (
        <IconButton
            ref={moreButtonRef}
            className='more-btn'
            disableRipple={false}
            aria-label={translate('PHONE.MENU_BUTTON_LABEL.SHOW_MORE')}
        >
            <Icon>
                <More />
            </Icon>
        </IconButton>
    );
    const { enableCallQuality } = AgentSvc.agentSettings;
    return (
        <CallDetailsPanelStyled
            className={className}
            data-aid={CALL_DETAILS_SECTION}
        >
            {originatedFrom &&
                enableCallQuality &&
                callUii &&
                !isCallPreview && (
                    <ReportCall
                        uii={uii}
                        enableReportModal={isReportModel}
                        closeReportModal={toggleReportCallClick}
                        listReportType={AgentSvc.reportIssueTypes}
                        postReportCall={CallSvc.postReportCall}
                        origin={originatedFrom}
                        returnFocusRef={moreButtonRef}
                    />
                )}
            <PanelHeader>
                <PanelTitleContent>
                    <PanelTitle>{title}</PanelTitle>
                    {callUii && !isCallPreview && (
                        <Popper
                            data-aid='more-call-options-dropdown'
                            id='more-call-options-dropdown'
                            toggleComponent={toggleComponent}
                            placement='bottom-start'
                            style={{
                                zIndex: 999,
                                backgroundColor: 'var(--menu-background)',
                            }}
                        >
                            <OptionStyled data-close={true}>
                                <CopyID
                                    idToCopy={callUii || ''}
                                    confirmationFunction={confirmationFunction}
                                ></CopyID>
                            </OptionStyled>

                            {enableCallQuality && (
                                <OptionStyled data-close={true}>
                                    <StyledLinkButton
                                        id='enableCallQualityBtn'
                                        title={translate(
                                            'SOFTPHONE.CALL_CONTROL_HELP.REPORT_CALL_QUALITY'
                                        )}
                                        onClick={toggleReportCallClick}
                                    />
                                </OptionStyled>
                            )}
                        </Popper>
                    )}
                </PanelTitleContent>
                {headerContent && (
                    <HeaderContent>{headerContent}</HeaderContent>
                )}
            </PanelHeader>
            {dataPairsContainer}
        </CallDetailsPanelStyled>
    );
};
