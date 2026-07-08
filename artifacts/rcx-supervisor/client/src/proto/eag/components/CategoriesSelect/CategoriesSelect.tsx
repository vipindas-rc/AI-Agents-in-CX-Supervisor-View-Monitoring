import { useEffect } from 'react';

import { InfoBar } from '@ringcx/ui';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CategoriesSelectControl } from './CategoriesSelectControl';
import { DISPOSITION_CATEGORY_AUTOCOMPLETE } from '../../constants/testIds';
import type {
    CategoryGroup,
    SelectedCategories,
} from '../CategoriesAutoComplete/types';

type CategoriesSelectProps = {
    value: SelectedCategories;
    options: CategoryGroup[];
    onChange: (categories: SelectedCategories) => void;
    emptyFields: string[];
};

export const CategoriesSelect = ({
    value,
    options,
    onChange,
    emptyFields,
}: CategoriesSelectProps) => {
    const { t } = useTranslation();

    const form = useForm({
        defaultValues: value,
    });

    const categories = form.watch();

    useEffect(() => {
        onChange(categories);
    }, [onChange, categories]);

    return (
        <FormProvider {...form}>
            {emptyFields.length > 0 && (
                <div className='disposition-form-group'>
                    <InfoBar type='error'>
                        <span>
                            {t(
                                'DISPOSITIONS.CATEGORIES.MANDATORY_CATEGORIES_REQUIRED_FIELD',
                                {
                                    group: emptyFields[0],
                                    count: emptyFields.length,
                                }
                            )}
                        </span>
                    </InfoBar>
                </div>
            )}
            {options.map((group) => (
                <div
                    className='disposition-form-group categories-autocomplete'
                    key={group.id}
                    data-aid={`${DISPOSITION_CATEGORY_AUTOCOMPLETE}_${group.id}`}
                >
                    <CategoriesSelectControl
                        name={group.id}
                        data={group.categories}
                        label={group.name}
                        required={group.mandatory}
                        multiple={group.multiple}
                    />
                </div>
            ))}
        </FormProvider>
    );
};
