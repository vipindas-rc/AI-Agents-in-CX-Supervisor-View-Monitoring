import { useMemo, useState } from 'react';

import { useStatsDataContext } from './StatsDataContext';
import { dataKeyMap, metricTypeToColumnsMap, toInt } from './StatsTableUtils';
import { useAngularModule } from '../../CRM/Hooks/useAngularModule';
import type {
    StatsCrmMetric,
    TableData,
    SortOption,
    TableType,
} from '../types/Stats';

export const useStatsTable = (metric: StatsCrmMetric) => {
    const DashboardSvc = useAngularModule('DashboardSvc');
    const statsData = useStatsDataContext();
    const [sortOption, setSortOption] = useState<SortOption | null>(null);
    const selectedType = DashboardSvc.selectedType as TableType;
    const columns = metricTypeToColumnsMap[selectedType];
    const data = statsData[metric.type]?.[
        dataKeyMap[selectedType]
    ] as TableData[];
    const savedMetrics = DashboardSvc.getSavedAgentDashboardByType(
        DashboardSvc.selectedType
    );
    const hiddenColumns = savedMetrics?.hiddenColumns || [];
    const tableColumns = columns.filter(
        (column) => !hiddenColumns.includes(column.field)
    );
    const totals = useMemo(() => {
        if (!data?.length) {
            return {};
        }
        const result: Record<string, number> = {};
        for (const column of tableColumns) {
            if (column.couldSum) {
                result[column.field] = data.reduce((acc, item) => {
                    return acc + toInt(item[column.field]);
                }, 0);
            }
        }
        return result;
    }, [data, tableColumns]);
    const sortedData = useMemo(() => {
        if (!data?.length) {
            return [];
        }
        if (!sortOption || data[0][sortOption.field] === undefined) {
            return data;
        }
        return [...data].sort((a, b) => {
            const aValue = a[sortOption.field];
            const bValue = b[sortOption.field];
            if (sortOption.direction === 'asc') {
                return aValue.localeCompare(bValue, undefined, {
                    numeric: true,
                });
            }
            return bValue.localeCompare(aValue, undefined, {
                numeric: true,
            });
        });
    }, [data, sortOption]);
    return {
        tableData: sortedData,
        scrollColumns: tableColumns.filter((column) => !column.pinnedLeft),
        fixedColumn: tableColumns[0]?.pinnedLeft ? tableColumns[0] : null,
        handleSort: (field: string) => {
            setSortOption((prev) => ({
                field,
                direction:
                    prev?.field === field && prev.direction === 'asc'
                        ? 'desc'
                        : 'asc',
            }));
        },
        sortOption,
        totals,
    };
};
