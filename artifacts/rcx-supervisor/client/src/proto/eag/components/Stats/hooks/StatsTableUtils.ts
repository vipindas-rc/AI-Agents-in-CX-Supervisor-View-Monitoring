import { StatsTableColumnType } from '../constant';
import type { TableType, StatsTableColumn } from '../types/Stats';

export const dataKeyMap = {
    OutboundMetrics: 'campaigns',
    InboundMetrics: 'queues',
    ChatMetrics: 'chatQueues',
};

export const toInt = (value: string | number) => {
    if (typeof value === 'string') {
        return parseInt(value, 10);
    }
    return value || 0;
};

export const metricTypeToColumnsMap: Record<TableType, StatsTableColumn[]> = {
    OutboundMetrics: [
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.NAME',
            field: 'campaignName',
            type: StatsTableColumnType.STRING,
            pinnedLeft: true,
            calCellValue: (row) => `${row.campaignId} - ${row.campaignName}`,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.STAFF',
            field: 'staffed',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.AVAIL',
            field: 'available',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.INC',
            field: 'ready',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.PEND',
            field: 'pending',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.ACT',
            field: 'active',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.COMP',
            field: 'complete',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.ERR',
            field: 'error',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.ANS',
            field: 'answer',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.NO_ANS',
            field: 'noanswer',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.MACH',
            field: 'machine',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.INT',
            field: 'intercept',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.BUSY',
            field: 'busy',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.FAX',
            field: 'fax',
            couldSum: true,
            type: StatsTableColumnType.NUMBER,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.ABAN',
            field: 'abandon',
            couldSum: true,
            type: StatsTableColumnType.NUMBER,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.T_TT',
            field: 'totalTalkTime',
            couldSum: true,
            type: StatsTableColumnType.DURATION,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.outbound.GRID.CONN',
            field: 'totalConnects',
            couldSum: true,
            type: StatsTableColumnType.NUMBER,
        },
    ],
    InboundMetrics: [
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.NAME',
            field: 'queueName',
            type: StatsTableColumnType.STRING,
            pinnedLeft: true,
            calCellValue: (row) => `${row.queueId} - ${row.queueName}`,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.CALLS',
            field: 'calls',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.QUEUED',
            field: 'inQueue',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.ROUTE',
            field: 'routing',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.CONN',
            field: 'active',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
            calCellValue: (row) => {
                return (
                    toInt(row.active) -
                    (toInt(row.inQueue) + toInt(row.routing))
                );
            },
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.LONG_Q',
            field: 'longestInQueue',
            type: StatsTableColumnType.DURATION,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.PRES',
            field: 'presented',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.ANS',
            field: 'answer',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.ABA',
            field: 'abandon',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.DEF',
            field: 'deflected',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.LONG_C',
            field: 'longCall',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.SHORT_C',
            field: 'shortCall',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.SHORT_ABA',
            field: 'shortAbandon',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.ASA',
            field: 'asa',
            type: StatsTableColumnType.DURATION,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.AVG_T',
            field: 'avgTalk',
            type: StatsTableColumnType.DURATION,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.AVG_ABA',
            field: 'avgAbandon',
            type: StatsTableColumnType.DURATION,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.STAFF',
            field: 'staffed',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.AVAIL',
            field: 'available',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.UTIL',
            field: 'utilization',
            type: StatsTableColumnType.PERCENT,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.SLA',
            field: 'sla',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.SLA_P',
            field: 'slaPass',
            type: StatsTableColumnType.PERCENT,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.SLA_F',
            field: 'slaFail',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.SLA_UN',
            field: 'slaUnq',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
            calCellValue: (row) => {
                return (
                    toInt(row.presented) -
                    (toInt(row.slaFail) + toInt(row.slaPass))
                );
            },
        },
    ],
    ChatMetrics: [
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.NAME',
            field: 'chatQueueName',
            type: StatsTableColumnType.STRING,
            pinnedLeft: true,
            calCellValue: (row) => `${row.chatQueueId} - ${row.chatQueueName}`,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.ACTIVE',
            field: 'active',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.QUEUED',
            field: 'inQueue',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.ROUTE',
            field: 'routing',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.CONN',
            field: 'calculateActive',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
            calCellValue: (row) => {
                return (
                    toInt(row.active) -
                    (toInt(row.inQueue) + toInt(row.routing))
                );
            },
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.PRES',
            field: 'presented',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.ACCEPT',
            field: 'accepted',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.ABA',
            field: 'abandon',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.DEF',
            field: 'deflected',
            type: StatsTableColumnType.NUMBER,
            couldSum: true,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.AVG_Q',
            field: 'avgQueueTime',
            type: StatsTableColumnType.DURATION,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.AVG_CHAT',
            field: 'avgChatTime',
            type: StatsTableColumnType.DURATION,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.chat.GRID.AVG_ABA',
            field: 'avgAbandon',
            type: StatsTableColumnType.DURATION,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.STAFF',
            field: 'staffed',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.AVAIL',
            field: 'available',
            type: StatsTableColumnType.NUMBER,
            couldSum: false,
        },
        {
            displayName: 'REALTIME_REPORTING.WIDGET.inbound.GRID.UTIL',
            field: 'utilization',
            type: StatsTableColumnType.PERCENT,
            couldSum: false,
        },
    ],
};
