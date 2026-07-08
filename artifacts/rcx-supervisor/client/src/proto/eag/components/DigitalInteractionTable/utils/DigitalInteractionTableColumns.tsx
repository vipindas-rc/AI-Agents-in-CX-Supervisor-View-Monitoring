import { SortType } from '@ringcx/ui';

import translate from '../../../helpers/translate';

export const DigitalInteractionTableColumns = [
    {
        id: 'initialEngagementSourceName',
        name: translate(
            'MONITORING.DIGITAL_INTERACTIONS.CHANNEL_COLUMN_HEADER'
        ),
        sortAs: SortType.STRING,
        visible: true,
        disabled: true,
        width: 180,
        content: '',
    },
    {
        id: 'productName',
        name: translate(
            'MONITORING.DIGITAL_INTERACTIONS.PRODUCT_COLUMN_HEADER'
        ),
        sortAs: SortType.STRING,
        visible: true,
        disabled: true,
        width: 160,
        content: '',
    },
    {
        id: 'agentDurationMs',
        name: translate(
            'MONITORING.DIGITAL_INTERACTIONS.INTERACTION_COLUMN_HEADER'
        ),
        sortAs: SortType.NUMBER,
        visible: true,
        disabled: true,
        width: 97,
        content: '',
    },
    {
        id: 'fullName',
        name: translate('MONITORING.DIGITAL_INTERACTIONS.AGENT_COLUMN_HEADER'),
        sortAs: SortType.STRING,
        visible: true,
        disabled: true,
        width: 160,
        content: '',
    },
    {
        id: 'contactIdentity',
        name: translate('MONITORING.DIGITAL_INTERACTIONS.FROM_COLUMN_HEADER'),
        sortAs: SortType.STRING,
        visible: true,
        disabled: true,
        width: 180,
        content: '',
    },
    {
        id: 'threadTitle',
        name: translate(
            'MONITORING.DIGITAL_INTERACTIONS.SUBJECT_COLUMN_HEADER'
        ),
        sortAs: SortType.STRING,
        visible: true,
        disabled: true,
        width: 200,
        content: '',
    },
    {
        id: 'pendingDispositionMs',
        name: translate(
            'MONITORING.DIGITAL_INTERACTIONS.PENDING_DISPOSITION_COLUMN_HEADER'
        ),
        sortAs: SortType.NUMBER,
        visible: true,
        disabled: true,
        width: 97,
        content: '',
    },
];
