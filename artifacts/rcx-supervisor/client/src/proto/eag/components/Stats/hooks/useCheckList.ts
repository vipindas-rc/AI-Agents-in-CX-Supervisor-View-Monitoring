import { useState } from 'react';

import { metricTypeToColumnsMap } from './StatsTableUtils';
import { useAngularModule } from '../../CRM/Hooks/useAngularModule';
import { DashboardType } from '../constant';
import type { StatsCrmMetric, TableType } from '../types/Stats';

export interface CheckItem {
    key: string;
    checked: boolean;
    label: string;
    disabled?: boolean;
}
export interface CheckListItem {
    checkItems: CheckItem[];
    checkLimit: number | null;
}

const CARD_CHECK_LIMIT = 4;
const DAILY_CARD_CHECK_LIMIT = 8;

export const useCheckList = (
    dashboardType: DashboardType,
    metrics: StatsCrmMetric[]
) => {
    const DashboardSvc = useAngularModule('DashboardSvc');

    const [checkList, setCheckList] = useState<CheckListItem[]>(
        (() => {
            if (
                [
                    DashboardType.INBOUND_METRICS,
                    DashboardType.OUTBOUND_METRICS,
                    DashboardType.CHAT_METRICS,
                ].includes(dashboardType)
            ) {
                const columns =
                    metricTypeToColumnsMap[dashboardType as TableType];
                const hiddenColumns =
                    DashboardSvc.getSavedAgentDashboardByType(dashboardType)
                        ?.hiddenColumns || [];
                const stats = metrics[0]?.stats || {
                    defaults: [],
                    availableData: [],
                };
                const reachedLimit = stats.defaults.length === CARD_CHECK_LIMIT;
                const cardCheckItems = stats.availableData.map((item) => ({
                    key: item.key,
                    checked: stats.defaults.includes(item.key),
                    label: `DASHBOARD.TYPES.STATS.${metrics[0].type.toUpperCase()}.${
                        item.key
                    }`,
                    disabled:
                        reachedLimit && !stats.defaults.includes(item.key),
                }));
                const tableCheckItems = columns.map((column) => ({
                    key: column.field,
                    checked: !hiddenColumns.includes(column.field),
                    label: column.displayName,
                }));
                return [
                    {
                        checkItems: cardCheckItems,
                        checkLimit: CARD_CHECK_LIMIT,
                    },
                    { checkItems: tableCheckItems, checkLimit: null },
                ];
            } else {
                const checkLimit =
                    dashboardType === DashboardType.DAILY_METRICS
                        ? DAILY_CARD_CHECK_LIMIT
                        : CARD_CHECK_LIMIT;
                return metrics.map((metric) => {
                    const stats = metric.stats;
                    const reachedLimit = stats.defaults.length === checkLimit;
                    const checkItems = stats.availableData.map((item) => ({
                        key: item.key,
                        checked: stats.defaults.includes(item.key),
                        label: `DASHBOARD.TYPES.STATS.${metric.type.toUpperCase()}.${
                            item.key
                        }`,
                        disabled:
                            reachedLimit && !stats.defaults.includes(item.key),
                    }));
                    return {
                        checkItems,
                        checkLimit,
                    };
                });
            }
        })()
    );
    const handleCheckboxChange = (
        checkListIndex: number,
        checkItemIndex: number,
        checked: boolean
    ) => {
        setCheckList((prevCheckList) => {
            const newCheckList = [...prevCheckList];
            const checkListItem = { ...newCheckList[checkListIndex] };
            const checkItems = [...checkListItem.checkItems];
            const checkItem = checkItems[checkItemIndex];
            if (checkItem) {
                checkItem.checked = checked;
                const checkLimit = checkListItem.checkLimit;
                if (checkLimit) {
                    const checkedCount = checkItems.filter(
                        (item) => item.checked
                    ).length;
                    if (checkedCount > checkLimit && checked) {
                        return prevCheckList;
                    } else if (checkedCount === checkLimit) {
                        checkItems.forEach((item) => {
                            item.disabled = !item.checked;
                        });
                    } else if (checkedCount < checkLimit) {
                        checkItems.forEach((item) => {
                            item.disabled = false;
                        });
                    }
                }
                checkItems[checkItemIndex] = checkItem;
                checkListItem.checkItems = checkItems;
                newCheckList[checkListIndex] = checkListItem;
            }

            return newCheckList;
        });
    };
    const handleSave = () => {
        if (
            [
                DashboardType.INBOUND_METRICS,
                DashboardType.OUTBOUND_METRICS,
                DashboardType.CHAT_METRICS,
            ].includes(dashboardType)
        ) {
            //save table
            const columns = checkList[1].checkItems.map((item) => ({
                field: item.key,
                visible: item.checked,
            }));
            DashboardSvc.saveDetails(columns);
        }
        metrics.forEach((metric, index) => {
            metric.stats.defaults = checkList[index].checkItems.reduce(
                (acc, item) => {
                    if (item.checked) {
                        acc.push(item.key);
                    }
                    return acc;
                },
                [] as string[]
            );
            DashboardSvc.saveMetrics(metric.type);
        });
    };
    return { checkList, handleCheckboxChange, handleSave };
};
