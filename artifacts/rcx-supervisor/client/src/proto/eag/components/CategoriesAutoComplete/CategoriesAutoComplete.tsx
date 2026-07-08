import { useEffect, useMemo } from 'react';

import {
    renderAutocompleteControl,
    TagColor,
    TagComponent as Tag,
    Edit,
} from '@ringcx/ui';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { StyledCategoriesAutoCompleteWrapper } from './CategoriesAutoComplete.styled';
import type { CategoryGroup, SelectedCategories, TagOption } from './types';

type CategoriesAutoCompleteProps = {
    value: SelectedCategories;
    options: CategoryGroup[];
    onOpen: () => void;
    emptyFields: string[];
    required: boolean;
};

export const CategoriesAutoComplete = ({
    value,
    options,
    onOpen,
    required,
    emptyFields,
}: CategoriesAutoCompleteProps) => {
    const { t } = useTranslation();

    const message =
        required && emptyFields.length
            ? t('DISPOSITIONS.CATEGORIES.MANDATORY_CATEGORIES_REQUIRED')
            : '';

    const data = useMemo(
        () => options.map((group) => group.categories).flat(),
        [options]
    );

    const categories = useMemo(() => Object.values(value).flat(), [value]);

    const form = useForm({
        defaultValues: { categories },
    });

    useEffect(() => {
        form.setValue('categories', categories);
    }, [form, categories]);

    const renderTags = (tags: TagOption[]) => {
        return tags.map((option, index) => {
            return (
                <Tag
                    key={index}
                    text={option.label}
                    color={option.options?.color || TagColor.Grey}
                />
            );
        });
    };

    return (
        <FormProvider {...form}>
            <StyledCategoriesAutoCompleteWrapper>
                <Controller
                    name='categories'
                    render={renderAutocompleteControl({
                        data,
                        label: t('DISPOSITIONS.CATEGORIES.TITLE'),
                        openText: t('GENERICS.ACTIONS.EDIT'),
                        required,
                        multiple: true,
                        open: false,
                        dataAid: 'categories',
                        message,
                        renderTags: renderTags,
                        onOpen,
                        popupIcon: <Edit style={{ fontSize: '16px' }} />,
                    })}
                />
            </StyledCategoriesAutoCompleteWrapper>
        </FormProvider>
    );
};
