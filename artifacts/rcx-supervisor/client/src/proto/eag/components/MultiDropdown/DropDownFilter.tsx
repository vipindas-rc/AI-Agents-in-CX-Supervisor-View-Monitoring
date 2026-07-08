import type { FC } from 'react';

import type { DropDownFilterType } from './types';
import translate from '../../helpers/translate';
import Filter from '../Filter';

export const DropDownFilter: FC<DropDownFilterType> = ({
    disableFilters,
    selectedFilters,
    onChangeFeature,
    allItems,
    openLabel,
    closeLabel,
    ariaLabel,
}) => {
    return (
        <Filter
            {...{
                openPlaceholder: translate(openLabel),
                closedPlaceholder: translate(closeLabel),
                ariaLabel: translate(ariaLabel ?? ''),
                selectedFilters,
                allItems,
                onChange: onChangeFeature,
                disabled: disableFilters,
                nothingAvailableText: translate(
                    'MONITORING.SEARCH_BAR.NOTHING_AVAILABLE'
                ),
                noResultsFoundText: translate(
                    'MONITORING.SEARCH_BAR.NO_RESULT_FOUND'
                ),
            }}
        />
    );
};
