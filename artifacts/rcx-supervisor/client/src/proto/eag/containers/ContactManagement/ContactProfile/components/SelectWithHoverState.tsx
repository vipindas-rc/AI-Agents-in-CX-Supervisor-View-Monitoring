import {
    useState,
    useRef,
    type ChangeEventHandler,
    useEffect,
    type KeyboardEvent,
} from 'react';

import { CaretDownMd } from '@ringcentral/spring-icon';
import { Select, Option, MenuItemText } from '@ringcentral/spring-ui';
import { isEscapeKey, isVerticalArrowKey } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { HoverableStateContainer } from './HoverableStateContainer';
import { SELECT_WITH_HOVER_STATE } from '../../../../constants/testIds';
import { genderOptions } from '../constants';

type SelectWithHoverStateProps = {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onSubmit?: () => void;
};

export const SelectWithHoverState = (props: SelectWithHoverStateProps) => {
    const [editState, setEditState] = useState(false);
    const { value, onChange, onSubmit } = props;
    const selectRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const [originalValue, setOriginalValue] = useState(value);

    const getRenderValue = () =>
        value
            ? genderOptions.find((option) => option.value === value)?.label
            : '-';

    useEffect(() => {
        if (editState) {
            buttonRef.current?.focus();
            buttonRef.current?.click();
        }
    }, [editState]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (isEscapeKey(e.key)) {
            e.preventDefault();
            onChange({
                target: { value: originalValue },
            } as React.ChangeEvent<HTMLInputElement>);
            setEditState(false);
        }
    };

    const handleMenuKeyDown = (e: KeyboardEvent) => {
        if (isVerticalArrowKey(e.key)) {
            e.stopPropagation();
        }
    };

    const handleEditClick = () => {
        setOriginalValue(value);
        setEditState(true);
    };

    if (editState) {
        return (
            <Select
                className='w-9/12'
                MenuProps={{
                    placement: 'bottom',
                    onKeyDown: handleMenuKeyDown,
                }}
                variant='outlined'
                size='large'
                value={value}
                onChange={onChange}
                ref={selectRef}
                renderValue={getRenderValue}
                onBlur={() => {
                    if (!selectRef.current?.classList.contains('sui-focused')) {
                        setEditState(false);
                        onSubmit?.();
                    }
                }}
                onKeyDown={handleKeyDown}
                data-aid={SELECT_WITH_HOVER_STATE}
                selectorProps={{
                    ref: buttonRef,
                }}
            >
                {genderOptions.map(({ key, value, label }) => {
                    return (
                        <Option key={key} value={value}>
                            <MenuItemText>{label}</MenuItemText>
                        </Option>
                    );
                })}
            </Select>
        );
    }

    return (
        <HoverableStateContainer
            renderContent={getRenderValue}
            editIconSymbol={CaretDownMd}
            editIconTitle={t('CONTACT_MANAGEMENT.CONTACT_PROFILE.SELECT')}
            onClickEditButton={handleEditClick}
        />
    );
};
