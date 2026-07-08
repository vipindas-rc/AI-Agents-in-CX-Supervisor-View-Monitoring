import { Fragment, memo, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import FilterToggle from './components/FilterToggle';
import {
    StyledSearch,
    StyledSearchIcon,
    StyledIconButton,
    StyledClearIcon,
} from './SearchInput.styled';
import type { ISearchInput } from './types';
import { TEST_AID } from '../../../constants/index';
import { EMPTY_CALLBACK } from '../../../helpers/usage';
import { i18next } from '../../../services/translate';
import { TextInput } from '../TextInput/';
import TextInputType from '../TextInput/types/TextInputType';

const SearchInput = ({
    value = '',
    size = 'medium',
    disabled = false,
    error = false,
    message = '',
    title = '',
    enableFilter = false,
    filterInitState = false,
    filterLabel,
    filterCount,
    onFilterToggle,
    onChange = EMPTY_CALLBACK,
    onClean = EMPTY_CALLBACK,
    ariaLabel = '',
    ...restProps
}: ISearchInput) => {
    const { t } = useTranslation(undefined, { i18n: i18next });
    const searchIcon = <StyledSearchIcon />;

    const clearIcon = useMemo(
        () => (
            <Fragment>
                {value && value.length > 0 && (
                    <StyledIconButton
                        aria-label={t('ARIA_LABELS.CLOSE')}
                        data-aid={TEST_AID.CLOSE_X_BUTTON}
                        onClick={() => {
                            onChange('');
                            onClean();
                        }}
                    >
                        <StyledClearIcon />
                    </StyledIconButton>
                )}
                {enableFilter && (
                    <FilterToggle
                        label={filterLabel}
                        count={filterCount}
                        onToggle={onFilterToggle}
                        initState={filterInitState}
                    />
                )}
            </Fragment>
        ),
        [
            value,
            enableFilter,
            filterLabel,
            filterCount,
            onFilterToggle,
            filterInitState,
            onChange,
            onClean,
        ]
    );

    return (
        <StyledSearch>
            <TextInput
                data-aid={TEST_AID.SEARCH_BAR}
                {...{
                    value,
                    size,
                    type: TextInputType.TEXT,
                    disabled,
                    error,
                    message,
                    title,
                    onChange,
                    leftIcon: searchIcon,
                    rightIcon: clearIcon,
                    ariaLabel,
                    ...restProps,
                }}
            />
        </StyledSearch>
    );
};

export default memo(SearchInput);
