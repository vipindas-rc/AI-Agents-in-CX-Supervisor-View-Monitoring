import { useMemo, type FC } from 'react';

import { TabContext, Tab, TabPanel } from '@ringcentral/spring-ui';
import { LeftChevron, Button } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { DashboardType } from './constant';
import type { CheckListItem } from './hooks/useCheckList';
import { useCheckList } from './hooks/useCheckList';
import {
    StatsSettingsContainer,
    StatsSettingsHeader,
    StatsSettingsContent,
    StatsSettingCheckboxContainer,
    StatsSettingCheckboxList,
    StyledTabs,
    StyledSpan,
    StyledActionsContainer,
    StyledCheckbox,
} from './StatsSettings.styled';
import type { StatsSettingsProps, ITab } from './types/Stats';

export const StatsSettings: FC<StatsSettingsProps> = ({
    onBackPressed,
    dashboardType,
    metrics,
}) => {
    const { t } = useTranslation();
    const tabs: ITab[] | undefined = useMemo(() => {
        if (
            [
                DashboardType.INBOUND_METRICS,
                DashboardType.OUTBOUND_METRICS,
                DashboardType.CHAT_METRICS,
            ].includes(dashboardType)
        ) {
            return [
                {
                    label: t('DASHBOARD.TYPES.STATS.CARDS'),
                    title: `${dashboardType}-cards`,
                },
                {
                    label: t('DASHBOARD.TYPES.STATS.TABLE'),
                    title: `${dashboardType}-table`,
                },
            ];
        } else if (dashboardType === DashboardType.BLENDED_METRICS) {
            return metrics.map((metric) => ({
                label: t(
                    `DASHBOARD.TYPES.STATS.${metric.type.toUpperCase()}.${metric.type.toUpperCase()}`
                ),
                title: `${dashboardType}-${metric.type}`,
            }));
        }
        return [];
    }, [dashboardType]);

    const { checkList, handleCheckboxChange, handleSave } = useCheckList(
        dashboardType,
        metrics
    );

    const checkboxListRender = (
        checkListItem: CheckListItem,
        checkListIndex: number
    ) => {
        return (
            <StatsSettingCheckboxList>
                {checkListItem.checkLimit && (
                    <StyledSpan
                        isTooltip
                        tooltipMsg={t(
                            'DASHBOARD.TYPES.STATS.CHOOSE_LIMIT_TIP',
                            {
                                limit: checkListItem.checkLimit,
                            }
                        )}
                    >
                        {t('DASHBOARD.TYPES.STATS.CHOOSE_LIMIT_TIP', {
                            limit: checkListItem.checkLimit,
                        })}
                    </StyledSpan>
                )}
                {checkListItem.checkItems.map((checkItem, checkItemIndex) => (
                    <StatsSettingCheckboxContainer key={checkItem.key}>
                        <StyledCheckbox
                            disabled={checkItem.disabled}
                            checked={checkItem.checked}
                            inputProps={{
                                'aria-label': t(checkItem.label),
                            }}
                            onChange={(e, value) =>
                                handleCheckboxChange(
                                    checkListIndex,
                                    checkItemIndex,
                                    value
                                )
                            }
                        />
                        <StyledSpan
                            disabled={checkItem.disabled}
                            tooltipMsg={t(checkItem.label)}
                        >
                            {t(checkItem.label)}
                        </StyledSpan>
                    </StatsSettingCheckboxContainer>
                ))}
            </StatsSettingCheckboxList>
        );
    };
    const saveAndBack = () => {
        handleSave();
        onBackPressed();
    };

    return (
        <StatsSettingsContainer data-sui-theme-scope>
            <StatsSettingsHeader>
                <span>
                    <button
                        onClick={onBackPressed}
                        aria-label={t('GENERICS.BACK')}
                    >
                        <LeftChevron />
                    </button>
                </span>
                <span>{t('PHONE.MENU_BUTTON_LABEL.SETTING')}</span>
                <span />
            </StatsSettingsHeader>
            <StatsSettingsContent>
                {dashboardType !== 'DailyMetrics' ? (
                    <TabContext defaultValue={0}>
                        <StyledTabs variant='scrollable'>
                            {tabs?.map((tab, index) => (
                                <Tab
                                    style={{
                                        fontSize: '12px',
                                        paddingBottom: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                    }}
                                    key={index}
                                    value={index}
                                    variant='label'
                                    label={tab.label}
                                    title={tab.title}
                                />
                            ))}
                        </StyledTabs>
                        {checkList.map((checkListItem, checkListIndex) => (
                            <TabPanel
                                key={checkListIndex}
                                value={checkListIndex}
                            >
                                {checkboxListRender(
                                    checkListItem,
                                    checkListIndex
                                )}
                            </TabPanel>
                        ))}
                    </TabContext>
                ) : (
                    checkboxListRender(checkList[0], 0)
                )}
            </StatsSettingsContent>
            <StyledActionsContainer>
                <Button
                    key='cancel'
                    variant='text'
                    size='small'
                    color='primary'
                    onClick={onBackPressed}
                >
                    {t('GENERICS.ACTIONS.CANCEL')}
                </Button>
                <Button key='save' onClick={saveAndBack} size='small'>
                    {t('GENERICS.ACTIONS.SAVE')}
                </Button>
            </StyledActionsContainer>
        </StatsSettingsContainer>
    );
};
