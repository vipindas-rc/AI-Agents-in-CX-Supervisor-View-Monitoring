import { useCallback, useState } from 'react';

import { CaretLeftMd, SearchMd } from '@ringcentral/spring-icon';
import { Icon, Button } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import { ActionButtons } from './components/ActionButtons';
import { QueueList } from './components/QueueList';
import { SkillSelector } from './components/SkillSelector';
import { ANALYTICS_OPTIONS, REQUEUE_TYPE, VIEW_STATE } from './constants';
import { useRequeueActions } from './hooks/useRequeueActions';
import { useRequeueData } from './hooks/useRequeueData';
import {
    StyledDialog,
    RequeueContainer,
    HeaderContainer,
    ContentContainer,
    ListContainer,
    StyledTextField,
    SearchContainer,
} from './Requeue.styled';
import type { RequeueProps, RequeueQueue, RequeueShortcut } from './types';
import {
    REQUEUE_DIALOG,
    REQUEUE_CONTAINER,
    REQUEUE_HEADER,
    REQUEUE_HEADER_BACK,
    REQUEUE_SEARCH_INPUT,
} from '../../constants/testIds';
import { useBehaviorSubject } from '../../helpers/useBehaviorSubject';

export const Requeue = ({
    CallSvc,
    AcdSvc,
    AgentSvc,
    AnalyticsSvc,
    CrmSvc,
}: RequeueProps) => {
    const { t } = useTranslation();
    const isOpen = useBehaviorSubject(CrmSvc.$requeueOpen);

    const {
        requeueType,
        allowCrossQueueRequeue,
        viewState,
        setViewState,
        queues,
        shortcuts,
        metricsMap,
        metricsLoaded,
        selectedQueue,
        selectedShortcut,
        selectedSkill,
        selectQueue,
        selectShortcut,
        selectSkill,
        clearSelection,
    } = useRequeueData({
        CallSvc,
        AcdSvc,
        AgentSvc,
        AnalyticsSvc,
        isRequeueOpen: isOpen,
    });

    const {
        trackSearchInputClick,
        trackChooseSkillClicked,
        handleRequeue,
        handleAskFirst,
        handleCancel,
    } = useRequeueActions({
        AnalyticsSvc,
        CrmSvc,
        CallSvc,
        requeueType,
    });
    const [searchQuery, setSearchQuery] = useState('');

    const isSkillSelectorView = viewState === VIEW_STATE.SKILL_SELECTOR;
    const queueId = selectedQueue?.gateId ?? selectedShortcut?.gateId;
    const skillId = selectedSkill?.skillId ?? selectedShortcut?.skillId;
    const availableSkills = selectedQueue?.groupSkills || [];

    const handleBack = useCallback(() => {
        if (isSkillSelectorView && allowCrossQueueRequeue) {
            setViewState(VIEW_STATE.QUEUE_LIST);
            setSearchQuery('');
        } else {
            handleCancel();
            clearSelection();
            setSearchQuery('');
        }
    }, [
        isSkillSelectorView,
        allowCrossQueueRequeue,
        setViewState,
        setSearchQuery,
        handleCancel,
        clearSelection,
    ]);

    const handleChooseSkill = useCallback(() => {
        if (!selectedQueue) return;
        trackChooseSkillClicked();
        setViewState(VIEW_STATE.SKILL_SELECTOR);
        setSearchQuery('');
    }, [selectedQueue, trackChooseSkillClicked, setViewState, setSearchQuery]);

    const handleAskFirstClick = useCallback(() => {
        if (!queueId) return;
        handleAskFirst({
            queueId,
            skillId,
        });
        clearSelection();
        setSearchQuery('');
    }, [queueId, skillId, handleAskFirst, clearSelection, setSearchQuery]);

    const handleRequeueClick = useCallback(() => {
        if (!queueId) return;
        handleRequeue({
            queueId,
            skillId,
            viewState,
        });
        clearSelection();
        setSearchQuery('');
    }, [
        queueId,
        skillId,
        viewState,
        handleRequeue,
        clearSelection,
        setSearchQuery,
    ]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            if (isSkillSelectorView) {
                trackSearchInputClick(ANALYTICS_OPTIONS.CHOOSE_SKILL);
            } else if (requeueType === REQUEUE_TYPE.ADVANCED) {
                trackSearchInputClick(ANALYTICS_OPTIONS.REQUEUE);
            } else {
                trackSearchInputClick(ANALYTICS_OPTIONS.REQUEUE_SHORTCUT);
            }
            setSearchQuery(newValue);
        },
        [
            isSkillSelectorView,
            requeueType,
            trackSearchInputClick,
            setSearchQuery,
        ]
    );

    const isCrossQueueDisabledAndNoSkills =
        !allowCrossQueueRequeue && availableSkills.length === 0;
    const searchPlaceholder = isSkillSelectorView
        ? t('SOFTPHONE.REQUEUE.SEARCH_SKILL')
        : t('SOFTPHONE.REQUEUE.SEARCH_QUEUE');

    const handleSelect = useCallback(
        (item: RequeueQueue | RequeueShortcut | null) => {
            if (requeueType === REQUEUE_TYPE.ADVANCED) {
                selectQueue(item as RequeueQueue);
            } else {
                selectShortcut(item as RequeueShortcut);
            }
        },
        [requeueType, selectQueue, selectShortcut]
    );

    return (
        <StyledDialog
            open={isOpen}
            className='z-[5260]'
            size='large'
            disableBackdropClick
            onClose={handleCancel}
            data-aid={REQUEUE_DIALOG}
        >
            <RequeueContainer data-aid={REQUEUE_CONTAINER}>
                <HeaderContainer data-aid={REQUEUE_HEADER}>
                    <Button
                        size='medium'
                        variant='text'
                        onClick={handleBack}
                        data-aid={REQUEUE_HEADER_BACK}
                        aria-label={t('SOFTPHONE.REQUEUE.BACK')}
                        startIcon={<Icon symbol={CaretLeftMd} size='small' />}
                    >
                        {t('SOFTPHONE.REQUEUE.BACK')}
                    </Button>
                </HeaderContainer>
                <ContentContainer>
                    {!isCrossQueueDisabledAndNoSkills && (
                        <SearchContainer>
                            <StyledTextField
                                fullWidth
                                variant='outlined'
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                startAdornment={
                                    <Icon
                                        symbol={SearchMd}
                                        size='small'
                                        className='text-[#70768D]'
                                    />
                                }
                                inputProps={{
                                    'data-aid': REQUEUE_SEARCH_INPUT,
                                    'aria-label': searchPlaceholder,
                                }}
                                classes={{
                                    input: 'text-base rounded-[4px]',
                                    formFieldContent: 'rounded-[4px] h-9',
                                }}
                            />
                        </SearchContainer>
                    )}
                    <ListContainer>
                        {isSkillSelectorView ? (
                            <SkillSelector
                                skills={availableSkills}
                                selectedSkillId={selectedSkill?.skillId ?? null}
                                onSelectSkill={selectSkill}
                                searchQuery={searchQuery}
                                isCrossQueueDisabledAndNoSkills={
                                    isCrossQueueDisabledAndNoSkills
                                }
                            />
                        ) : requeueType === REQUEUE_TYPE.ADVANCED ? (
                            <QueueList
                                items={queues}
                                metricsMap={metricsMap}
                                selectedId={selectedQueue?.gateId ?? null}
                                onSelect={handleSelect}
                                searchQuery={searchQuery}
                                metricsLoaded={metricsLoaded}
                                isAdvanced={true}
                            />
                        ) : (
                            <QueueList
                                items={shortcuts}
                                metricsMap={metricsMap}
                                selectedId={selectedShortcut?.gateId ?? null}
                                onSelect={handleSelect}
                                searchQuery={searchQuery}
                                metricsLoaded={metricsLoaded}
                                isAdvanced={false}
                            />
                        )}
                    </ListContainer>
                </ContentContainer>
                <ActionButtons
                    mode={requeueType}
                    isQueueSelected={Boolean(selectedQueue || selectedShortcut)}
                    hasSkills={availableSkills.length > 0}
                    viewState={viewState}
                    onChooseSkill={handleChooseSkill}
                    onAskFirst={handleAskFirstClick}
                    onRequeue={handleRequeueClick}
                />
            </RequeueContainer>
        </StyledDialog>
    );
};
