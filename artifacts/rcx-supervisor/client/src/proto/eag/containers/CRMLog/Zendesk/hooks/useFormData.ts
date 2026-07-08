import { useState } from 'react';

import type { IZendeskLogFormData } from '../types';

export function useFormData(
    defaultSubject: string,
    initialFormData?: IZendeskLogFormData
) {
    const defaultFormData = {
        subject: defaultSubject,
        user: undefined,
    };

    const [formData, setFormData] = useState<IZendeskLogFormData>({
        ...defaultFormData,
        ...initialFormData,
    });

    return { formData, setFormData };
}
