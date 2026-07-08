import type { MatchItem } from '../../../../components/CRM/types';
import { RecordType } from '../constants';
import type { PartitionedRecords } from './useUpdateHubSpotMatchRecords.type';

export function partitionRecords(records: MatchItem[]): PartitionedRecords {
    const matchedAssociations: MatchItem[] = [];
    const recentlyCreatedAssociations: MatchItem[] = [];

    for (const item of records) {
        if (item.type === RecordType.Outcome) {
            continue;
        }
        matchedAssociations.push(item);
        if (item.recentlyCreated) {
            recentlyCreatedAssociations.push(item);
        }
    }

    return {
        matchedAssociations,
        recentlyCreatedAssociations,
    };
}

function getAssociationKey(item: MatchItem): string {
    if (item.id) {
        return `${item.type || ''}:${item.id}`;
    }
    return `${item.type || ''}:${item.name}`;
}

export function mergeAssociations(
    current: MatchItem[] = [],
    incoming: MatchItem[] = []
): MatchItem[] {
    const merged = [...current];
    const existingKeys = new Set(current.map(getAssociationKey));

    for (const item of incoming) {
        const key = getAssociationKey(item);
        if (!existingKeys.has(key)) {
            merged.unshift(item);
            existingKeys.add(key);
        }
    }

    return merged;
}
