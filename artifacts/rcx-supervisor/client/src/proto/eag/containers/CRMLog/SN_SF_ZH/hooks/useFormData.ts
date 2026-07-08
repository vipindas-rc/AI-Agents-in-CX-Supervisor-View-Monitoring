import { useState } from 'react';

import type { FormData } from '../types';

export function useFormData(
    defaultSubject: string,
    initialFormData?: FormData
) {
    const defaultFormData = {
        subject: defaultSubject,
        name: undefined,
        relatedTo: undefined,
    };

    const [formData, setFormData] = useState<FormData>({
        ...defaultFormData,
        ...initialFormData,
    });

    return { formData, setFormData };
}
