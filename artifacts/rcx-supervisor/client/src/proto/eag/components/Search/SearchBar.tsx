import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { ISearchInput } from '@ringcx/ui';
import { SearchInput } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';
export const SearchBar: FC<{
    searchItem: string;
    filterLabel: string;
    filterInitState: boolean;
    filterCount?: ISearchInput['filterCount'];
    placeholder?: ISearchInput['placeholder'];
    setSearch: (val: string, reset: boolean) => void;
    onFilterToggle?: ISearchInput['onFilterToggle'];
}> = ({
    searchItem,
    filterCount,
    filterLabel,
    filterInitState,
    placeholder,
    setSearch,
    onFilterToggle,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [rendered, setRendered] = useState<boolean>(false);

    const setSearchFilter = useCallback(() => {
        if (searchQuery === '') {
            setSearch(searchQuery, true);
        }
        // normal search by agent name
        else {
            setSearch(searchQuery, false);
        }
    }, [searchQuery, setSearch]);

    useEffect(() => {
        if (searchItem !== null && searchItem !== undefined && !rendered) {
            setSearchQuery(searchItem);
            setRendered(true);
        }
    }, [rendered, searchItem]);

    useEffect(() => {
        setSearchFilter();
    }, [searchQuery, setSearchFilter]);

    return (
        <SearchInput
            placeholder={placeholder}
            enableFilter
            value={searchQuery}
            filterCount={filterCount}
            filterInitState={filterInitState}
            filterLabel={filterLabel}
            onChange={setSearchQuery}
            onFilterToggle={onFilterToggle}
        />
    );
};
export default CreateAngularModule(
    'searchBar',
    SearchBar,
    [
        'searchItem',
        'filterCount',
        'filterLabel',
        'placeholder',
        'setSearch',
        'onFilterToggle',
        'filterInitState',
    ],
    []
);
