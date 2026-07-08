import { useMemo, useState, type FC, Fragment } from 'react';

import type { IDropDownData } from '@ringcx/ui';
import { IconButton } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { DashboardType, testIds } from './constant';
import { StatsDataProvider } from './hooks/StatsDataContext';
import { SyncScrollProvider } from './hooks/SyncScrollContext';
import { StatsCards } from './StatsCards';
import {
    StatsCrmContainer,
    StatsCrmHeader,
    TypeSingleSelect,
    SettingIcon,
} from './StatsCrm.styled';
import { StatsSettings } from './StatsSettings';
import { StatsTable } from './StatsTable';
import type { StatsCrmProps } from './types/Stats';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const StatsCrm: FC<StatsCrmProps> = ({
    dashboardTypes,
    metrics,
    setSelectedType,
    selectedType,
}) => {
    const { t } = useTranslation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const onBackPressed = () => {
        setIsSettingsOpen(false);
    };

    const handleSelect = (type: string) => {
        setSelectedType(type);
    };
    const handleSettingIconClick = () => {
        setIsSettingsOpen(true);
    };
    const selectList: IDropDownData = useMemo(() => {
        return {
            items: dashboardTypes.map((type) => ({
                id: type,
                displayName: t(`DASHBOARD.TYPES.${type.toUpperCase()}`),
            })),
        };
    }, [dashboardTypes]);
    return (
        <StatsCrmContainer>
            {isSettingsOpen && (
                <StatsSettings
                    onBackPressed={onBackPressed}
                    dashboardType={selectedType}
                    metrics={metrics}
                />
            )}
            {!isSettingsOpen && (
                <Fragment>
                    <StatsCrmHeader>
                        <TypeSingleSelect
                            data={selectList}
                            onChange={handleSelect}
                            error={false}
                            useDefaultSort={false}
                            message={''}
                            selectedItemId={selectedType}
                            title={''}
                            size='small'
                        ></TypeSingleSelect>
                        <IconButton
                            onClick={handleSettingIconClick}
                            data-aid={testIds.STATS_SETTINGS_ICON}
                            aria-label={t('PHONE.MENU_BUTTON_LABEL.SETTING')}
                        >
                            <SettingIcon />
                        </IconButton>
                    </StatsCrmHeader>
                    {metrics?.length > 0 && (
                        <StatsDataProvider>
                            <StatsCards metrics={metrics} />
                            {[
                                DashboardType.OUTBOUND_METRICS,
                                DashboardType.INBOUND_METRICS,
                                DashboardType.CHAT_METRICS,
                            ].includes(selectedType) && (
                                <SyncScrollProvider>
                                    <StatsTable metric={metrics[0]} />
                                </SyncScrollProvider>
                            )}
                        </StatsDataProvider>
                    )}
                </Fragment>
            )}
        </StatsCrmContainer>
    );
};

export default CreateAngularModule(
    'statsCrm',
    StatsCrm,
    ['dashboardTypes', 'metrics', 'setSelectedType', 'selectedType'],
    [],
    true
);
