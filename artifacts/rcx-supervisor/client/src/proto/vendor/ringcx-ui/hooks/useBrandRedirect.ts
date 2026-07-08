import { useEffect, useState } from 'react';

import { BrandRedirect } from '@ringcx/shared';

type UseBrandRedirectReturn = {
    isFetchingBrandRedirect: boolean;
    brandRedirectUrl: string | null;
};

type UseBrandRedirect = {
    isAuthenticated: boolean;
    standAloneAgent?: boolean;
    standAloneAdmin?: boolean;
};

export const useBrandRedirect = ({
    isAuthenticated,
    standAloneAgent,
    standAloneAdmin,
}: UseBrandRedirect): UseBrandRedirectReturn => {
    const [isFetchingBrandRedirect, setIsFetchingBrandRedirect] =
        useState(true);
    const [brandRedirectUrl, setBrandRedirectUrl] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (isAuthenticated) {
            const checkBrandRedirect = async () => {
                try {
                    const brandRedirectUrl = await BrandRedirect.getRedirectUrl(
                        {
                            standAloneAgent,
                            standAloneAdmin,
                        }
                    );
                    if (brandRedirectUrl) {
                        setBrandRedirectUrl(brandRedirectUrl);
                    }
                } catch (e) {
                    window.console.error('Error fetching brand redirect', e);
                } finally {
                    setIsFetchingBrandRedirect(false);
                }
            };
            checkBrandRedirect();
        }
    }, [isAuthenticated, standAloneAgent, standAloneAdmin]);

    return {
        isFetchingBrandRedirect,
        brandRedirectUrl,
    };
};
