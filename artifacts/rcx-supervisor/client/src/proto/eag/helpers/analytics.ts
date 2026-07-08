import {
    Analytics,
    ProviderTypes,
    createModuleClosure,
    getAnalyticsToken,
    getAnalyticsCookieDomain,
} from '@ringcx/shared';

export const analytics = createModuleClosure(
    () =>
        new Analytics(ProviderTypes.MIXPANEL, {
            token: getAnalyticsToken(),
            cookieDomain: getAnalyticsCookieDomain(),
        })
);
