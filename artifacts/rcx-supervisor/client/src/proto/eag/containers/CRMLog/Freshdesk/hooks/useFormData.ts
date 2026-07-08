import { useState } from 'react';

import type { IFreshdeskLogFormData } from '../types';

export function useFormData(
    defaultSubject: string,
    initialFormData?: IFreshdeskLogFormData
) {
    const defaultFormData = {
        subject: defaultSubject,
        user: undefined,
    };

    const [formData, setFormData] = useState<IFreshdeskLogFormData>({
        ...defaultFormData,
        ...initialFormData,
    });

    return { formData, setFormData };
}
