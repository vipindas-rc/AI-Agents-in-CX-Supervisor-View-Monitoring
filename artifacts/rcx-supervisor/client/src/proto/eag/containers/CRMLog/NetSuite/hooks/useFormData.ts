import { useState } from 'react';

import { LinkedRecordType } from '../constants';
import type { FormData } from '../types';

export function useFormData(
    defaultSubject: string,
    initialFormData?: FormData
) {
    const defaultFormData = {
        subject: defaultSubject,
        company: undefined,
        [LinkedRecordType.CONTACT]: undefined,
        [LinkedRecordType.SUPPORTCASE]: undefined,
        [LinkedRecordType.TRANSACTION]: undefined,
    };

    const [formData, setFormData] = useState<FormData>({
        ...defaultFormData,
        ...initialFormData,
    });

    return { formData, setFormData };
}
