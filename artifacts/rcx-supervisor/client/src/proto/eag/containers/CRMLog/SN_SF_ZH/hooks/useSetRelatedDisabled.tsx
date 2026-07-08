import { useEffect, useState } from 'react';

import { CRMPlatform } from '../../../../constants/crm';
import type { FormData } from '../types';

export function useSetRelatedDisabled(formData: FormData, platform: string) {
    const [isRelatedToDisabled, setIsRelatedToDisabled] =
        useState<boolean>(false);
    useEffect(() => {
        if (
            formData?.name?.type === 'Lead' &&
            (platform === CRMPlatform.Salesforce ||
                platform === CRMPlatform.Zoho)
        ) {
            setIsRelatedToDisabled(true);
            formData.relatedTo = {
                id: '',
                name: '',
            };
        } else {
            setIsRelatedToDisabled(false);
        }
    }, [formData, platform]);

    return { isRelatedToDisabled };
}
