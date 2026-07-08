import type { ReactElement } from 'react';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';

import { AutocompleteWithHoverState } from './components/AutocompleteWithHoverState';
import { InputWithHoverState } from './components/InputWithHoverState';
import { SelectWithHoverState } from './components/SelectWithHoverState';
import { TextareaWithHoverState } from './components/TextareaWithHoverState';
import { profileFieldConfigs } from './constants';
import type { TagOption } from './types';
import {
    CONTACT_MANAGEMENT_PREFIX,
    CONTACT_MANAGEMENT_PROFILE_FORM,
} from '../../../constants/testIds';

type ProfileFormProps = {
    tags: TagOption[];
    onSubmit?: (kind: string, index?: number) => (data: any) => void;
    isCellPhoneOrEmailEmpty?: boolean;
    setIsCellPhoneOrEmailEmpty?: (value: boolean) => void;
};

export const ProfileForm = ({
    tags,
    onSubmit,
    isCellPhoneOrEmailEmpty,
    setIsCellPhoneOrEmailEmpty,
}: ProfileFormProps) => {
    const { control, handleSubmit } = useFormContext();

    const onFormSubmit = (kind: string, index?: number) => {
        return (
            onSubmit &&
            handleSubmit(onSubmit(kind, index), onSubmit(kind, index))
        );
    };

    const {
        fields: emailFields,
        insert: emailInsert,
        remove: emailRemove,
    } = useFieldArray({
        control,
        name: 'Email.items',
    });

    const {
        fields: mobilePhonesFields,
        insert: mobilePhonesInsert,
        remove: mobilePhonesRemove,
    } = useFieldArray({
        control,
        name: 'MobilePhones.items',
    });

    const {
        fields: homePhonesFields,
        insert: homePhonesInsert,
        remove: homePhonesRemove,
    } = useFieldArray({
        control,
        name: 'HomePhones.items',
    });

    const keyAndFieldConfigMap = {
        Email: {
            fields: emailFields,
            insert: emailInsert,
            remove: emailRemove,
        },
        MobilePhones: {
            fields: mobilePhonesFields,
            insert: mobilePhonesInsert,
            remove: mobilePhonesRemove,
        },
        HomePhones: {
            fields: homePhonesFields,
            insert: homePhonesInsert,
            remove: homePhonesRemove,
        },
    };

    const renderField = ({
        label,
        field,
        key,
    }: {
        label: string;
        field: ReactElement;
        key: string;
    }) => {
        return (
            <div
                className='flex'
                data-aid={`${CONTACT_MANAGEMENT_PREFIX}${key}`}
            >
                <div
                    className='text-neutral-b2 typography-descriptor w-24 pt-2.5'
                    data-aid='label'
                >
                    {label}
                </div>
                {field}
            </div>
        );
    };

    return (
        <div
            className='gap-1.25 grid p-4'
            data-aid={CONTACT_MANAGEMENT_PROFILE_FORM}
        >
            {profileFieldConfigs.map(
                ({ key, name, label, kind, type, isIdentifier }) => {
                    switch (key) {
                        case 'Gender':
                            return (
                                <Controller
                                    name={name as string}
                                    control={control}
                                    render={({ field }) =>
                                        renderField({
                                            label,
                                            key,
                                            field: (
                                                <SelectWithHoverState
                                                    {...field}
                                                    onSubmit={onFormSubmit(key)}
                                                />
                                            ),
                                        })
                                    }
                                />
                            );
                        case 'Email':
                        case 'MobilePhones':
                        case 'HomePhones':
                            return keyAndFieldConfigMap[key].fields.map(
                                (config, index, array) => (
                                    <Controller
                                        key={config.id}
                                        name={(
                                            name as (index: number) => string
                                        )(index)}
                                        control={control}
                                        render={({ field }) =>
                                            renderField({
                                                label,
                                                key,
                                                field: (
                                                    <InputWithHoverState
                                                        fieldKey={key}
                                                        showAddButton
                                                        insert={() => {
                                                            keyAndFieldConfigMap[
                                                                key
                                                            ].insert(
                                                                index + 1,
                                                                {
                                                                    kind,
                                                                    label: type,
                                                                    value: '',
                                                                    isIdentifier,
                                                                }
                                                            );
                                                        }}
                                                        remove={() => {
                                                            keyAndFieldConfigMap[
                                                                key
                                                            ].remove(index);
                                                        }}
                                                        isLastOne={
                                                            index ===
                                                            array.length - 1
                                                        }
                                                        index={index}
                                                        onSubmit={onFormSubmit(
                                                            key,
                                                            index
                                                        )}
                                                        isCellPhoneOrEmailEmpty={
                                                            key !==
                                                                'HomePhones' &&
                                                            isCellPhoneOrEmailEmpty
                                                        }
                                                        setIsCellPhoneOrEmailEmpty={
                                                            setIsCellPhoneOrEmailEmpty
                                                        }
                                                        label={label}
                                                        {...field}
                                                    />
                                                ),
                                            })
                                        }
                                    />
                                )
                            );
                        case 'TagIds':
                            if (!tags.length) {
                                return null;
                            }
                            return (
                                <Controller
                                    name={name as string}
                                    control={control}
                                    render={({ field }) =>
                                        renderField({
                                            label,
                                            key,
                                            field: (
                                                <AutocompleteWithHoverState
                                                    tags={tags}
                                                    label={label}
                                                    onSubmit={onFormSubmit(key)}
                                                    {...field}
                                                />
                                            ),
                                        })
                                    }
                                />
                            );
                        case 'Notes':
                            return (
                                <Controller
                                    name={name as string}
                                    control={control}
                                    render={({ field }) =>
                                        renderField({
                                            label,
                                            key,
                                            field: (
                                                <TextareaWithHoverState
                                                    label={label}
                                                    onSubmit={onFormSubmit(key)}
                                                    {...field}
                                                />
                                            ),
                                        })
                                    }
                                />
                            );
                        default:
                            return (
                                <Controller
                                    name={name as string}
                                    control={control}
                                    render={({ field }) =>
                                        renderField({
                                            label,
                                            key,
                                            field: (
                                                <InputWithHoverState
                                                    label={label}
                                                    fieldKey={key}
                                                    onSubmit={onFormSubmit(key)}
                                                    {...field}
                                                />
                                            ),
                                        })
                                    }
                                />
                            );
                    }
                }
            )}
        </div>
    );
};
