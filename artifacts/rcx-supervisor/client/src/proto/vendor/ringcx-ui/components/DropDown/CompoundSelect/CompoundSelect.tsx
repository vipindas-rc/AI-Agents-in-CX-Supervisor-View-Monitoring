import {
    type FC,
    type SyntheticEvent,
    useCallback,
    useState,
    memo,
    useMemo,
} from 'react';

import {
    CompoundSelectWrapper,
    SingleSelectWrapper,
    TextInputWrapper,
    ErrorMessage,
    InfoText,
} from './CompoundSelect.styled';
import type { CompoundSelectProps } from './types';
import { GroupMergeLayout, smallDefaultSize } from '../../GroupMergeLayout';
import { TextInput } from '../../Inputs/TextInput';
import SingleSelect from '../SingleSelect';
import type { IOnOpenProps } from '../types';

const CompoundSelect: FC<CompoundSelectProps> = ({
    id,
    data,
    size = 'small',
    title,
    onOpen,
    onClose,
    infoText,
    textInputProps,
    inputPosition,
    showInputWhenDropdownOpen = true,
    handleDropdownChange,
    dropdownWidth = '100px',
    useDefaultSort = false,
    requiredTitle = false, //this controls whether to show asterisk in the title
    error = false, //error along with error message control whether to show error message
    errorMessage,
    dropdownError = false, //this controls whether SingleSelect will be in error state. For text input, error prop in textInputProps will be used
    ...restProps
}) => {
    // passing onChange from angular triggers dropdown handler as well when there is an input change,
    // hence using a separate prop: handleDropdownChange
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    const handleDropdownOpen = useCallback(
        ({ wrapperRef, borderRef }: IOnOpenProps) => {
            setIsOpen(true);
            onOpen?.({ wrapperRef, borderRef });
        },
        [onOpen]
    );

    const handleDropdownClose = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    const handleInputFocus = useCallback(
        (value: SyntheticEvent<Element, Event> | undefined) => {
            setIsInputFocused(true);
            textInputProps?.onFocus?.(value);
        },
        [textInputProps]
    );

    const handleInputBlur = useCallback(
        (value: string) => {
            setIsInputFocused(false);
            textInputProps?.onBlur?.(value);
        },
        [textInputProps]
    );

    const showInput = useMemo(() => {
        return (
            inputPosition !== undefined &&
            (showInputWhenDropdownOpen || !isOpen)
        );
    }, [inputPosition, showInputWhenDropdownOpen, isOpen]);

    const input = useMemo(
        () =>
            showInput && (
                <TextInputWrapper
                    key={textInputProps?.dataAid || 'compound-input'}
                    hidden={
                        inputPosition === undefined ||
                        (!showInputWhenDropdownOpen && isOpen)
                    }
                >
                    <TextInput
                        data-aid={textInputProps?.dataAid}
                        onChange={textInputProps?.onChange}
                        error={!!textInputProps?.error}
                        {...textInputProps}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        value={textInputProps?.value ?? ''}
                    />
                </TextInputWrapper>
            ),
        [
            showInput,
            inputPosition,
            textInputProps,
            handleInputFocus,
            handleInputBlur,
            showInputWhenDropdownOpen,
            isOpen,
        ]
    );

    const dropdown = useMemo(
        () => (
            <SingleSelectWrapper
                key={id}
                setWidth={
                    inputPosition === undefined
                        ? false
                        : showInputWhenDropdownOpen
                          ? true
                          : !isOpen
                }
                inputPosition={inputPosition}
                dropdownWidth={dropdownWidth}
            >
                <SingleSelect
                    title={''}
                    size={size}
                    data={data}
                    error={dropdownError}
                    onOpen={handleDropdownOpen}
                    required={false}
                    onClose={handleDropdownClose}
                    {...restProps}
                    fixedOpeningDirection={true}
                    onChange={handleDropdownChange}
                    tooltipPlacement={'top-start'}
                    useDefaultSort={useDefaultSort}
                />
            </SingleSelectWrapper>
        ),
        [
            id,
            dropdownWidth,
            dropdownError,
            handleDropdownClose,
            handleDropdownOpen,
            handleDropdownChange,
            data,
            inputPosition,
            isOpen,
            restProps,
            size,
            useDefaultSort,
            showInputWhenDropdownOpen,
        ]
    );

    const components = useMemo(() => {
        if (inputPosition === 'left') {
            return [input as React.ReactElement, dropdown];
        } else if (inputPosition === 'right') {
            return [dropdown, input as React.ReactElement];
        }
        return [dropdown];
    }, [inputPosition, input, dropdown]);

    return (
        <CompoundSelectWrapper inputPosition={inputPosition}>
            <GroupMergeLayout
                title={title}
                size={smallDefaultSize}
                required={requiredTitle}
                dataAid={textInputProps?.dataAid}
                components={components}
            />
            {infoText && <InfoText>{infoText}</InfoText>}
            {!isOpen && !isInputFocused && error && errorMessage && (
                <ErrorMessage inputPosition={inputPosition}>
                    {errorMessage}
                </ErrorMessage>
            )}
        </CompoundSelectWrapper>
    );
};
export default memo(CompoundSelect);
