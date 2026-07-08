import type { MatchItem } from '../../../../components/CRM/types';

export interface UpdatedCallMatchRecordsData {
    records?: MatchItem[];
}

export interface PartitionedRecords {
    matchedAssociations: MatchItem[];
    recentlyCreatedAssociations: MatchItem[];
}
