import { RefreshMd, AskFirstMd, BargeMd } from '@ringcentral/spring-icon';
import { useTranslation } from 'react-i18next';

import { REQUEUE_TYPE, VIEW_STATE } from '../constants';
import {
    ButtonsContainer,
    ActionButtonWrapper,
    StyledIconButton,
    ActionButtonLabel,
} from './ActionButtons.styled';
import {
    REQUEUE_ACTION_BUTTONS,
    REQUEUE_CHOOSE_SKILL_BUTTON,
    REQUEUE_ASK_FIRST_BUTTON,
    REQUEUE_BUTTON,
} from '../../../constants/testIds';
import type { ActionButtonsProps } from '../types';

export const ActionButtons = ({
    mode,
    isQueueSelected,
    hasSkills,
    viewState,
    onChooseSkill,
    onAskFirst,
    onRequeue,
}: ActionButtonsProps) => {
    const { t } = useTranslation();

    const isActionDisabled = !isQueueSelected;
    const isChooseSkillDisabled = !isQueueSelected || !hasSkills;
    const isSkillSelectorPage = viewState === VIEW_STATE.SKILL_SELECTOR;

    return (
        <ButtonsContainer data-aid={REQUEUE_ACTION_BUTTONS}>
            {mode === REQUEUE_TYPE.ADVANCED && !isSkillSelectorPage && (
                <ActionButtonWrapper>
                    <StyledIconButton
                        variant='contained'
                        symbol={BargeMd}
                        size='xxlarge'
                        iconSize='medium'
                        shape='circular'
                        onClick={onChooseSkill}
                        disabled={isChooseSkillDisabled}
                        aria-label={t('SOFTPHONE.REQUEUE.CHOOSE_SKILL')}
                        data-aid={REQUEUE_CHOOSE_SKILL_BUTTON}
                        color='neutral'
                    />
                    <ActionButtonLabel
                        className='truncate text-center text-sm'
                        title={t('SOFTPHONE.REQUEUE.CHOOSE_SKILL')}
                        disabled={isChooseSkillDisabled}
                    >
                        {t('SOFTPHONE.REQUEUE.CHOOSE_SKILL')}
                    </ActionButtonLabel>
                </ActionButtonWrapper>
            )}

            <ActionButtonWrapper>
                <StyledIconButton
                    className='bg-neutral-b4'
                    symbol={AskFirstMd}
                    variant='contained'
                    size='xxlarge'
                    iconSize='medium'
                    shape='circular'
                    color='neutral'
                    onClick={onAskFirst}
                    disabled={isActionDisabled}
                    aria-label={t('SOFTPHONE.REQUEUE.WARM_REQUEUE')}
                    data-aid={REQUEUE_ASK_FIRST_BUTTON}
                />
                <ActionButtonLabel
                    className='truncate text-center text-sm'
                    title={t('SOFTPHONE.REQUEUE.WARM_REQUEUE')}
                    disabled={isActionDisabled}
                >
                    {t('SOFTPHONE.REQUEUE.WARM_REQUEUE')}
                </ActionButtonLabel>
            </ActionButtonWrapper>

            <ActionButtonWrapper>
                <StyledIconButton
                    symbol={RefreshMd}
                    variant='contained'
                    size='xxlarge'
                    iconSize='medium'
                    shape='circular'
                    color='neutral'
                    onClick={onRequeue}
                    disabled={isActionDisabled}
                    aria-label={t('SOFTPHONE.REQUEUE.REQUEUE')}
                    data-aid={REQUEUE_BUTTON}
                />
                <ActionButtonLabel
                    className='truncate text-center text-sm'
                    title={t('SOFTPHONE.REQUEUE.REQUEUE')}
                    disabled={isActionDisabled}
                >
                    {t('SOFTPHONE.REQUEUE.REQUEUE')}
                </ActionButtonLabel>
            </ActionButtonWrapper>
        </ButtonsContainer>
    );
};
