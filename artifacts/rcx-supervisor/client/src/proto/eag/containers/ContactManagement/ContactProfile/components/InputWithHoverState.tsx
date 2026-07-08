import {
    useState,
    type KeyboardEventHandler,
    type ChangeEventHandler,
} from 'react';

import { EnterMd } from '@ringcentral/spring-icon';
import { TextField, Icon } from '@ringcentral/spring-ui';
import { parsePhoneNumber } from '@ringcx/shared';
import { isEnterKey, isEscapeKey } from '@ringcx/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { HoverableStateContainer } from './HoverableStateContainer';
import injector from '../../../../helpers/injector';
import { phoneKindLabels } from '../constants';

type InputWithHoverStateProps = {
    fieldKey: string;
    value: string;
    label: string;
    showAddButton?: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
    insert?: () => void;
    remove?: () => void;
    index?: number;
    onSubmit?: () => void;
    isLastOne?: boolean;
    isCellPhoneOrEmailEmpty?: boolean;
    setIsCellPhoneOrEmailEmpty?: (value: boolean) => void;
};

export const InputWithHoverState = (props: InputWithHoverStateProps) => {
    const SessionSvc = injector('SessionSvc');
    const {
        fieldKey,
        value,
        label,
        onChange,
        showAddButton,
        insert,
        remove,
        index,
        onSubmit,
        isLastOne = false,
        isCellPhoneOrEmailEmpty,
        setIsCellPhoneOrEmailEmpty,
    } = props;

    const { t } = useTranslation();
    const [editState, setEditState] = useState(false);
    const {
        formState: { errors },
        clearErrors,
    } = useFormContext();

    const [formatValue, setFormatValue] = useState<string>(value);
    const [originalValue, setOriginalValue] = useState<string>(value);

    let errorMessage = '';
    if (['MobilePhones', 'Email'].includes(fieldKey)) {
        errorMessage =
            (errors[fieldKey] as any)?.items?.[index as number]?.message ?? '';
    }

    const onFieldChange: typeof onChange = (...args) => {
        if (
            ['MobilePhones', 'Email'].includes(fieldKey) &&
            isCellPhoneOrEmailEmpty
        ) {
            setIsCellPhoneOrEmailEmpty?.(false);
            setEditState(true);
        }
        if (['MobilePhones', 'Email'].includes(fieldKey) && errorMessage) {
            clearErrors(`${fieldKey}.items[${index}]`);
            setEditState(true);
        }
        setFormatValue(args[0].target.value);
        onChange(...args);
    };

    const onBlur = () => {
        setEditState(false);
        if (phoneKindLabels.includes(fieldKey) && SessionSvc.isI18nEnabled()) {
            const parsedNumber = parsePhoneNumber(formatValue);
            setFormatValue(parsedNumber.value);
        }
        if (index && !formatValue && !isCellPhoneOrEmailEmpty) {
            remove?.();
        }
        onSubmit?.();
    };

    const onClickAddButton = () => {
        insert?.();
    };

    const handleKeyDown: KeyboardEventHandler<
        HTMLInputElement & HTMLTextAreaElement
    > = (e) => {
        const { key } = e;

        if (isEnterKey(key)) {
            onBlur();
        }

        if (isEscapeKey(key)) {
            e.preventDefault();
            setFormatValue(originalValue);
            setEditState(false);
        }
    };

    const isNoIdentifierError =
        isCellPhoneOrEmailEmpty &&
        isLastOne &&
        fieldKey === 'MobilePhones' &&
        t('CONTACT_MANAGEMENT.CONTACT_PROFILE.IDENTIFIER_IS_REQUIRED');

    if (isCellPhoneOrEmailEmpty || errorMessage || editState) {
        return (
            <TextField
                size='large'
                type='text'
                variant='outlined'
                clearBtn={false}
                className='w-9/12'
                endAdornment={<Icon symbol={EnterMd} />}
                onKeyDown={handleKeyDown}
                onBlur={onBlur}
                value={formatValue}
                onChange={onFieldChange}
                autoFocus
                error={isCellPhoneOrEmailEmpty || !!errorMessage}
                helperText={isNoIdentifierError || errorMessage}
                inputProps={{
                    'aria-label': label,
                }}
            />
        );
    }

    const renderContent = () => formatValue || '-';

    const handleEditClick = () => {
        setOriginalValue(formatValue);
        setEditState(true);
    };

    return (
        <HoverableStateContainer
            renderContent={renderContent}
            onClickEditButton={handleEditClick}
            showAddButton={showAddButton}
            onClickAddButton={onClickAddButton}
        />
    );
};
