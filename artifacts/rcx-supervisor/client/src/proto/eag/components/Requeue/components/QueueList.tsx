import { useTranslation } from 'react-i18next';

import { QueueItem } from './QueueItem';
import {
    REQUEUE_QUEUE_LIST,
    REQUEUE_QUEUE_GROUP,
    REQUEUE_SHORTCUT_LIST,
    REQUEUE_EMPTY_STATE,
} from '../../../constants/testIds';
import type { RequeueQueue, RequeueShortcut } from '../types';
import { EmptyContainer } from './Empty.styled';

export interface QueueListProps {
    items: RequeueQueue[] | RequeueShortcut[];
    metricsMap: Record<number, import('../types').QueueMetrics>;
    selectedId: string | null;
    onSelect: (item: RequeueQueue | RequeueShortcut | null) => void;
    searchQuery: string;
    metricsLoaded: boolean;
    isAdvanced?: boolean;
}

export const QueueList = ({
    items,
    metricsMap,
    selectedId,
    onSelect,
    searchQuery,
    metricsLoaded,
    isAdvanced = true,
}: QueueListProps) => {
    const { t } = useTranslation();

    const filteredItems = !searchQuery.trim()
        ? items
        : items.filter((item) => {
              const searchText = searchQuery.toLowerCase();
              if (isAdvanced) {
                  return (item as RequeueQueue).gateName
                      .toLowerCase()
                      .includes(searchText);
              }
              return (item as RequeueShortcut).name
                  .toLowerCase()
                  .includes(searchText);
          });

    if (filteredItems.length === 0) {
        return (
            <EmptyContainer data-aid={REQUEUE_EMPTY_STATE}>
                {t('DIALPAD.NO_RECORDS_FOUND')}
            </EmptyContainer>
        );
    }

    const renderItem = (item: RequeueQueue | RequeueShortcut) => (
        <QueueItem
            key={item.gateId}
            metricsLoaded={metricsLoaded}
            queue={item}
            metrics={metricsMap[Number(item.gateId)]}
            isSelected={selectedId === item.gateId}
            onClick={() => onSelect(item)}
            isAdvanced={isAdvanced}
        />
    );

    if (!isAdvanced) {
        return (
            <div
                role='list'
                aria-label={t('SOFTPHONE.REQUEUE.SHORTCUT')}
                data-aid={REQUEUE_SHORTCUT_LIST}
            >
                {filteredItems.map(renderItem)}
            </div>
        );
    }

    const groupedItems: Record<string, RequeueQueue[]> = {};
    (filteredItems as RequeueQueue[]).forEach((queue) => {
        const groupName = queue.groupName;
        if (!groupedItems[groupName]) {
            groupedItems[groupName] = [];
        }
        groupedItems[groupName].push(queue);
    });

    return (
        <div data-aid={REQUEUE_QUEUE_LIST}>
            {Object.keys(groupedItems).map((groupName) => (
                <div
                    className='mb-3 last:mb-0'
                    key={groupName}
                    data-aid={REQUEUE_QUEUE_GROUP}
                >
                    <div className='text-neutral-b2 pl-4 pr-4 text-sm'>
                        {groupName}
                    </div>
                    <div role='list' aria-label={groupName}>
                        {groupedItems[groupName].map(renderItem)}
                    </div>
                </div>
            ))}
        </div>
    );
};
