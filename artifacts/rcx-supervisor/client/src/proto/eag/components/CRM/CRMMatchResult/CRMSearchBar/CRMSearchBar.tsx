import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useContext, useState, useCallback } from 'react';

import {
    CRMSearchInputWrapper,
    CRMSearchInput,
    StyledSearchIcon,
} from './CRMSearchBar.styled';
import type { CRMSearchBarProps } from './types/index';
import { CRM_SEARCH_RECORD } from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import { LogKindContext } from '../../../../helpers/logKind';
import { DataTrackingEventNames } from '../../constants';

const CRMSearchBar: FC<CRMSearchBarProps> = ({ placeholder, handleSearch }) => {
    const [searchValue, setSearchValue] = useState<string>('');

    const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }, []);
    const logKind = useContext(LogKindContext);
    const AnalyticsSvc = injector('AnalyticsSvc');

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                AnalyticsSvc.track(DataTrackingEventNames.RCXSearch, {
                    method: logKind?.logKindType,
                });
                handleSearch(searchValue);
            }
        },
        [searchValue, handleSearch]
    );

    return (
        <CRMSearchInputWrapper>
            <CRMSearchInput
                title={placeholder}
                placeholder={placeholder}
                value={searchValue}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                data-aid={CRM_SEARCH_RECORD}
            ></CRMSearchInput>
            <StyledSearchIcon />
        </CRMSearchInputWrapper>
    );
};

export default CRMSearchBar;
