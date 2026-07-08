import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { Dropdown, LinkButton, Spinner, Sync } from '@ringcx/ui';

import { CallHistoryRecord } from './CallHistoryRecord';
import { EmptyHistory } from './EmptyHistory';
import { HistorySeparator } from './HistorySeparator';
import translate from '../../../../helpers/translate';
import type {
    IHistoryComponentArray,
    IHistoryRecord,
    IHistoryState,
    ILoadHistoryButton,
} from '../types/CallHistoryRecord';

export const LoadHistoryButton: FC<ILoadHistoryButton> = ({
    leadSvc,
    updateHistoryList,
    leadId,
}) => {
    /*
     * Array of icons to show the states of history.
     * */
    const historyStatesIconArray: ReactNode[] = useMemo(() => {
        return [
            <Dropdown key={1} />,
            <Spinner size={'small'} key={2} />,
            <Sync key={3} />,
        ];
    }, []);

    const [historyState, setHistoryState] = useState<IHistoryState>({
        title: translate('CURRENT_CALL.HISTORY.SHOW_HISTORY'),
        icon: historyStatesIconArray[0],
        disabled: false,
        position: 'right',
    });

    /**
     * Returns an empty history component .
     * @return <EmptyHistory/>
     */
    const emptyHistory = () => {
        return [<EmptyHistory key={0} />];
    };

    const fetchHistory = useCallback(() => {
        /**
         * Builds an array of History records component based on the result returned by lead service.
         * @param result {Array<IHistoryRecord> }
         * @return {Array<IHistoryComponentArray> }
         */
        const buildHistory = (result: Array<IHistoryRecord>) => {
            const compArr: IHistoryComponentArray[] = [];

            result.forEach((value, index) => {
                const callHistory = (
                    <CallHistoryRecord key={index} historyRecord={value} />
                );
                compArr.push(callHistory);
                // adding line separator in the history panel for multiple records.
                if (result.length > 1 && index + 1 < result.length) {
                    compArr.push(<HistorySeparator key={value.passUii} />);
                }
            });
            return compArr;
        };

        /**
         * Function gets called upon clicking show history button. It fetches history using lead Id passed as param
         * and updates state of the history list of the parent component ( CallHistoryPanel ) and
         * also the state of the show history button.
         */
        const getHistory = () => {
            setHistoryState((prevState) => ({
                ...prevState,
                icon: historyStatesIconArray[1],
                disabled: true,
            }));

            leadSvc
                .leadHistory(leadId)
                .then(function (result: Array<IHistoryRecord>) {
                    if (result.length) {
                        updateHistoryList(buildHistory(result));
                    } else {
                        updateHistoryList(emptyHistory);
                    }
                    setHistoryState({
                        title: translate('CURRENT_CALL.HISTORY.REFRESH'),
                        icon: historyStatesIconArray[2],
                        disabled: false,
                    });
                })
                .catch((error: Error) => {
                    console.error(error.message);
                });
        };

        getHistory();
    }, [historyStatesIconArray, leadId, updateHistoryList, leadSvc]);

    return (
        <LinkButton
            onClick={fetchHistory}
            icon={historyState.icon}
            title={historyState.title}
            iconPosition={historyState.position}
            disabled={historyState.disabled}
        />
    );
};
