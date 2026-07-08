import { Session } from '@ringcx/shared';

import injector from './injector';

export const checkUnifiedInboxEnabled = (): boolean => {
    const featureFlagsService = injector('FeatureFlagsSvc');
    return (
        Session.isEmbeddedAgentClientAppType() &&
        !!featureFlagsService?.featureFlags?.isUnifiedInboxAvailable
    );
};
