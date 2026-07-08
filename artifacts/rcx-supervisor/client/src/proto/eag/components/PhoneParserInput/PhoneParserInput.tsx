import type { FC } from 'react';

import { PhoneInput } from '@ringcx/ui';

import CreateAngularModule from '../../helpers/CreateAngularModule';

export const PhoneParserInput: FC<{
    value: string;
    label: string;
    error?: boolean;
    homeCountryCode?: string;
}> = ({ value, label, homeCountryCode, error, ...restProps }) => {
    const key = homeCountryCode || 'key';

    const props = {
        key,
        value: value || '',
        title: label,
        ...restProps,
    };

    return (
        <PhoneInput
            {...(error === undefined
                ? props
                : {
                      ...props,
                      error,
                  })}
        />
    );
};

export default CreateAngularModule('phoneParserInput', PhoneParserInput, [
    'errorMessage',
    'requiredMessage',
    'helpMessage',
    'message',
    'required',
    'value',
    'enableValidation',
    'legacyMode',
    'onChange',
    'onBlur',
    'onError',
    'label',
    'size',
    'placeholder',
    'availableCountryIds',
    'homeCountryCode',
    'forceParse',
    'error',
    'countryRestrictionMessage',
    'placement',
    'disabled',
    'fieldNameTooltip',
    'ariaLabel',
]);
