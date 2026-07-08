import type { DashboardType, StatsTableColumnType } from '../constant';

export type MetricType =
    | 'stats_agent_daily'
    | 'stats_campaign'
    | 'stats_queue'
    | 'stats_chat_queue';
export interface StatsCrmMetric {
    dashboardType: DashboardType;
    type: MetricType;
    order: number;
    stats: {
        availableData: {
            key: string;
            type: string;
        }[];
        defaults: string[];
    };
}
export interface StatsProps {
    metrics: StatsCrmMetric[];
}

export interface StatsCrmProps extends StatsProps {
    dashboardTypes: string[];
    setSelectedType: (type: string) => void;
    selectedType: DashboardType;
}

export interface StatsSettingsProps {
    onBackPressed: () => void;
    dashboardType: DashboardType;
    metrics: StatsCrmMetric[];
}

export interface StatsTableProps {
    metric: StatsCrmMetric;
}

export type TableData = Record<string, any>;

export type SortOption = {
    field: string;
    direction: 'asc' | 'desc';
};

export type TableType =
    | DashboardType.OUTBOUND_METRICS
    | DashboardType.INBOUND_METRICS
    | DashboardType.CHAT_METRICS;

export type StatsTableColumn = {
    displayName: string;
    field: string;
    type: StatsTableColumnType;
    couldSum?: boolean;
    pinnedLeft?: boolean;
    calCellValue?: (row: any) => string | number;
};

export interface ITab {
    label: string;
    title: string;
}
