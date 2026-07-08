import type { FC } from 'react';

import { formatOutboundVoicemailAgentNotes } from '@ringcx/shared';

import { PanelBody } from '../../../../components/CallDetailsPanel/CallDetailsPanel.styled';
import { DataPairs } from '../../../../components/DataPairs';
import { PANEL_BODY } from '../../../../constants/testIds';
import { formatPassDate } from '../../../../helpers/timeUtils';
import translate from '../../../../helpers/translate';
import type { ICallHistoryRecord } from '../types/CallHistoryRecord';

export const CallHistoryRecord: FC<ICallHistoryRecord> = ({
    historyRecord,
}) => {
    /**
     * Array contains the actual keys of the history records returned by the lead service and their
     * equivalent labels for display separated by ':'.
     */
    const prefix = 'PHONE.PREVIEW.DETAIL.HISTORY';
    const historyLabels = [
        `passNumber:${prefix}.PASS_NUM`,
        `passDts:${prefix}.DATE`,
        `agentName:${prefix}.AGENT`,
        `agentDisposition:${prefix}.AGENT_DISP`,
        `agentNotes:${prefix}.AGENT_NOTES`,
        `passDisposition:${prefix}.SYSTEM_DISP`,
    ];

    const agentNotesLabels = {
        manualEntry: translate('PHONE.AGENT_NOTES_LABELS.MANUAL_ENTRY'),
        accountAudio: translate('PHONE.AGENT_NOTES_LABELS.ACCOUNT_AUDIO'),
        globalAudio: translate('PHONE.AGENT_NOTES_LABELS.GLOBAL_AUDIO'),
    };

    const dataPairList = () => {
        return historyLabels.map((histLabel, index) => {
            const labelArr = histLabel.split(':');
            // @ts-ignore
            let dataPairValue = historyRecord[labelArr[0]] || '-';
            if (labelArr[0] === 'agentNotes') {
                dataPairValue =
                    formatOutboundVoicemailAgentNotes(
                        historyRecord.agentNotes,
                        agentNotesLabels,
                        historyRecord.passDisposition
                    ) || '-';
            }

            if (labelArr[0].includes('passDts') && dataPairValue !== '-') {
                dataPairValue = formatPassDate(dataPairValue);
            }

            if (
                labelArr[0].includes('passDisposition') &&
                dataPairValue !== '-'
            ) {
                dataPairValue = translate(
                    dataPairValue
                        ? `LEAD_DETAIL.LEAD_STATES.${dataPairValue.toUpperCase()}`
                        : '--'
                );
            }
            return (
                <DataPairs
                    key={`${labelArr[0]}${index}`}
                    label={translate(labelArr[1])}
                    value={dataPairValue}
                />
            );
        });
    };

    return <PanelBody data-aid={PANEL_BODY}>{dataPairList()}</PanelBody>;
};
