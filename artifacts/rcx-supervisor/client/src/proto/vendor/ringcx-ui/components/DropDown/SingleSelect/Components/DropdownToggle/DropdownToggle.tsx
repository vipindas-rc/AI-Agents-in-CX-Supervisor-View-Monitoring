import type { ChangeEvent, FC, KeyboardEvent, SyntheticEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    StyledCloseIcon,
    StyledDotVariant,
    StyledToggle,
    StyledToggleFilter,
} from './DropdownToggle.styled';
import type { IDropdownToggle } from './types';
import { TEST_AID } from '../../../../../constants/index';
import { isActivationKey } from '../../../../../helpers/keyboard';
import { CloseSvg } from '../../../../../icons';
import { ArrowDirection } from '../../../../../icons/types/Arrow';
import { t } from '../../../../../services/translate';
import { Dot } from '../../../../Dot';
import Spinner from '../../../../Spinner';
import { TagComponent } from '../../../../Tag';
import { TextEclipse } from '../../../../TextEclipse';
import ArrowIcon from '../../../Components/ArrowIcon';
import { StyledDigitalFontIcon } from '../../../Components/ListItem/ListItem.styled';
import { StyledPlaceholder, TextEclipseStyled } from '../../../DropDown.styled';
import { isDotVariantGuard, isTagVariantGuard } from '../../../types';

const DropdownToggle: FC<IDropdownToggle> = ({
    size,
    isOpen,
    disabled,
    isSearchable,
    filterValue = '',
    placeholder = isSearchable ? 'Search' : 'Select',
    placeholderVariant,
    loadingPlaceholder = 'Loading...',
    showExistItem,
    activePlaceholder,
    handleFilterChange,
    handleToggleClick,
    loading,
    enableClearButton,
    onChange,
    toggleIcon,
    tooltipPlacement,
    ariaLabel,
    ariaLabelledBy,
}) => {
    const filterRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState<string>(filterValue);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen && filterRef.current) {
            filterRef.current.focus();
        }
    }, [isOpen]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation();
            const { value } = e.target;
            if (isFocused) {
                setLocalValue(value);
                handleFilterChange(value);
            }
        },
        [handleFilterChange, isFocused]
    );

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setLocalValue(filterValue);
    }, [filterValue]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        if (!isOpen) {
            setLocalValue('');
        }
    }, [isOpen]);

    const handleClick = useCallback((e: SyntheticEvent) => {
        e.stopPropagation();
    }, []);

    const onClearClick = useCallback(
        (e: SyntheticEvent) => {
            e.stopPropagation();
            setLocalValue('');
            onChange('');
        },
        [onChange]
    );

    const onClearKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (isActivationKey(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                setLocalValue('');
                onChange('');
            }
        },
        [onChange]
    );

    const content = useMemo(() => {
        if (isSearchable && isOpen) {
            return (
                <StyledToggleFilter
                    onChange={handleChange}
                    value={localValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={handleClick}
                    placeholder={placeholder}
                    showExistItem={showExistItem}
                    ref={filterRef}
                />
            );
        }

        if (isTagVariantGuard(placeholderVariant)) {
            return (
                <TagComponent
                    text={placeholder}
                    color={placeholderVariant.color}
                    bordered={false}
                />
            );
        }

        if (isDotVariantGuard(placeholderVariant)) {
            return (
                <StyledDotVariant>
                    <Dot color={placeholderVariant.color} />
                    <TextEclipse tooltipMsg={placeholder}>
                        {placeholder}
                    </TextEclipse>
                </StyledDotVariant>
            );
        }

        return (
            <StyledPlaceholder
                showExistItem={showExistItem || activePlaceholder}
            >
                <TextEclipseStyled
                    tooltipMsg={loading ? loadingPlaceholder : placeholder}
                    {...(tooltipPlacement && {
                        placement: tooltipPlacement,
                    })}
                >
                    {loading ? loadingPlaceholder : placeholder}
                </TextEclipseStyled>
            </StyledPlaceholder>
        );
    }, [
        activePlaceholder,
        handleBlur,
        handleChange,
        handleClick,
        handleFocus,
        isOpen,
        isSearchable,
        loading,
        loadingPlaceholder,
        localValue,
        placeholder,
        placeholderVariant,
        showExistItem,
        tooltipPlacement,
    ]);

    return (
        <StyledToggle
            {...{
                onClick: handleToggleClick,
                disabled,
                isOpen,
                className: 'eui-dropdown-toggle',
                size,
                'data-aid': TEST_AID.DROPDOWN_TOGGLE,
                role: 'button',
                ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy }),
                ...(ariaLabel && { 'aria-label': ariaLabel }),
            }}
        >
            {toggleIcon && <StyledDigitalFontIcon code={toggleIcon} />}
            {content}
            {enableClearButton && (
                <StyledCloseIcon
                    onClick={onClearClick}
                    onKeyDown={onClearKeyDown}
                    tabIndex={0}
                    role='button'
                    aria-label={t('ARIA_LABELS.CLOSE')}
                    data-aid={TEST_AID.SINGLE_SELECT_CLOSE_ICON}
                >
                    <CloseSvg />
                </StyledCloseIcon>
            )}
            {loading ? (
                <Spinner size='small' />
            ) : (
                <ArrowIcon
                    direction={isOpen ? ArrowDirection.UP : ArrowDirection.DOWN}
                    disabled={disabled}
                />
            )}
        </StyledToggle>
    );
};

export default memo(DropdownToggle);
