import { useState, type HTMLAttributes } from 'react';

import { Box } from '@mui/material';
import {
    renderAutocompleteControl,
    TagColor,
    TagComponent as Tag,
    TextEclipse,
} from '@ringcx/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { StyledCategoriesSelectWrapper } from './CategoriesSelect.styled';
import type { TagOption } from '../CategoriesAutoComplete/types';

type CategoriesSelectControlProps = {
    name: string;
    data: TagOption[];
    label: string;
    required: boolean;
    multiple: boolean;
};

export const CategoriesSelectControl = ({
    name,
    data,
    label,
    required,
    multiple,
}: CategoriesSelectControlProps) => {
    const { t } = useTranslation();
    const { setValue, getValues } = useFormContext();
    const [open, setOpen] = useState(false);

    const handleSingleChange = (value: string[]) => {
        const currentValue = getValues(name);
        const newValue = value.filter((v) => !currentValue.includes(v));
        setValue(name, newValue);
        setOpen(false);
    };

    const renderTag = (option: TagOption, closable = false) => {
        const onClose = () => {
            const values = getValues(name);
            const newValues = values.filter(
                (value: string) => value !== option.id
            );
            setValue(name, newValues);
        };
        return (
            <Tag
                key={option.id}
                text={option.label}
                color={option.options?.color || TagColor.Grey}
                onClose={closable ? onClose : undefined}
                bordered={false}
            />
        );
    };

    const renderTags = (tags: TagOption[]) => {
        return tags.map((option) => renderTag(option, true));
    };

    const renderOption = (
        props: HTMLAttributes<HTMLLIElement>,
        option: TagOption
    ) => {
        return (
            <Box
                component='li'
                key={option.id}
                {...props}
                sx={{
                    '&:hover': {
                        backgroundColor: 'var(--neutral-b5-color) !important',
                    },
                }}
            >
                <TextEclipse
                    tooltipMsg=''
                    popperProps={{
                        style: { zIndex: 9999 },
                    }}
                >
                    {renderTag(option)}
                </TextEclipse>
            </Box>
        );
    };

    const props = multiple ? {} : { onChange: handleSingleChange };

    return (
        <StyledCategoriesSelectWrapper>
            <Controller
                name={name}
                defaultValue={[]}
                render={renderAutocompleteControl({
                    data,
                    label,
                    dataAid: name,
                    required,
                    multiple: true,
                    disableClearable: false,
                    filterSelectedOptions: true,
                    renderTags,
                    renderOption,
                    open,
                    onOpen: () => setOpen(true),
                    onClose: () => setOpen(false),
                    noOptionsText: t('DISPOSITIONS.CATEGORIES.NO_RESULT_FOUND'),
                    ...props,
                })}
            />
        </StyledCategoriesSelectWrapper>
    );
};
