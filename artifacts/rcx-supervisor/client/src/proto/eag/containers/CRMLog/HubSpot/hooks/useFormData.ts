import { useState } from 'react';

import type { IHubSpotLogFormData } from '../types';

export function useFormData(
    defaultSubject: string,
    initialFormData?: IHubSpotLogFormData
) {
    const defaultFormData = {
        subject: defaultSubject,
        associations: undefined,
        displayName: '',
    };

    const [formData, setFormData] = useState<IHubSpotLogFormData>({
        ...defaultFormData,
        ...initialFormData,
    });

    return { formData, setFormData };
}
