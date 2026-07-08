import { yupResolver } from '@hookform/resolvers/yup';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import type { UseConfigFormOptions } from './types';

export const useConfigForm = <T extends FieldValues>(
    options?: UseConfigFormOptions<T>
) => {
    const { validationScheme, defaultValues } = options || {};

    return useForm<T>({
        defaultValues,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
        resolver: validationScheme ? yupResolver(validationScheme) : undefined,
    });
};
