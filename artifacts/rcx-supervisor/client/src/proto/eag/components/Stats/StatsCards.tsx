import { useCallback, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import {
    DashboardType,
    TOTAL_SAFE_DIALS,
    TOTAL_PREVIEW_DIALS,
} from './constant';
import { useStatsDataContext } from './hooks/StatsDataContext';
import {
    StatsCrmCardsWrapper,
    StatsCrmCard,
    StatsCrmCardContainer,
    StatsCrmCardContent,
    StatsCrmCardGroupLabel,
    StatsCrmCardTitle,
} from './StatsCards.styled';
import type { StatsCrmMetric, StatsProps } from './types/Stats';
import { useAngularModule } from '../CRM/Hooks/useAngularModule';

export const StatsCards: FC<StatsProps> = ({ metrics }) => {
    const { t } = useTranslation();
    const Utils = useAngularModule('Utils');
    const statsData = useStatsDataContext();
    const STATS_DATA_TYPES = useAngularModule('STATS_DATA_TYPES');
    const formatData = useCallback(
        (metric: StatsCrmMetric, defaultKey: string, data: any) => {
            const availableDataItem = metric.stats.availableData.find(
                (item) => item.key === defaultKey
            );
            const type = availableDataItem?.type;
            let result = '';
            switch (type) {
                case STATS_DATA_TYPES.NUMBER:
                    result = Utils.formatNumber(data);
                    break;
                case STATS_DATA_TYPES.TIME:
                    result = Utils.formatTime(data);
                    if (typeof result === 'string' && data > 60) {
                        result = result.replace(/\s*\d+s$/, '');
                    }
                    break;
                case STATS_DATA_TYPES.AVERAGE:
                    result = Utils.formatPercentage(data);
                    break;
                default:
                    result = data;
                    break;
            }
            return result;
        },
        [Utils, STATS_DATA_TYPES]
    );
    const getMetricValue = (metric: StatsCrmMetric, defaultKey: string) => {
        const keyParts = defaultKey.split('.');
        let result = statsData[metric.type];
        if (result) {
            if (keyParts[0] === TOTAL_SAFE_DIALS) {
                result[TOTAL_SAFE_DIALS] = result[TOTAL_PREVIEW_DIALS];
            }
            keyParts.forEach((k) => {
                result = result[k];
            });
        } else {
            result = 0;
        }
        return formatData(metric, defaultKey, result);
    };
    return metrics.map((metric) => (
        <StatsCrmCardsWrapper
            key={metric.type}
            data-aid={`stats-card-wrapper-${metric.type}`}
            data-sui-theme-scope
        >
            {metric.dashboardType === DashboardType.BLENDED_METRICS &&
                metric.stats.defaults.length > 0 && (
                    <StatsCrmCardGroupLabel>
                        {t(
                            `DASHBOARD.TYPES.STATS.${metric.type}.${metric.type}`.toUpperCase()
                        )}
                    </StatsCrmCardGroupLabel>
                )}
            <StatsCrmCardContainer>
                {metric.stats.defaults.map((defaultKey, index) => (
                    <StatsCrmCard
                        key={index}
                        data-aid={`stats-card-${defaultKey}`}
                    >
                        <StatsCrmCardTitle
                            tooltipMsg={t(
                                `DASHBOARD.TYPES.STATS.${metric.type.toUpperCase()}.${defaultKey}`
                            )}
                        >
                            {`${t(
                                `DASHBOARD.TYPES.STATS.${metric.type.toUpperCase()}.${defaultKey}`
                            )}`}
                        </StatsCrmCardTitle>
                        <StatsCrmCardContent>
                            {getMetricValue(metric, defaultKey)}
                        </StatsCrmCardContent>
                    </StatsCrmCard>
                ))}
            </StatsCrmCardContainer>
        </StatsCrmCardsWrapper>
    ));
};
