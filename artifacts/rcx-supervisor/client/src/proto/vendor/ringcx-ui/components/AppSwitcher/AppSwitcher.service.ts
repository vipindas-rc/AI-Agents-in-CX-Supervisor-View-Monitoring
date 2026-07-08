import type { IFullUserDetails, AppPermissions } from '@ringcx/shared';
import { UserService, Navigation } from '@ringcx/shared';

import type { IRoutes } from './types';

const DefaultRoutes: IRoutes = {
    Agent: '/agent',
    Admin: '/admin',
    Analytics: '/analytics',
    WEMEnterprise: '',
    RingSense: '',
};

export const getPermissions = async (
    portalType?: number
): Promise<[AppPermissions, IRoutes]> => {
    const routes = { ...DefaultRoutes };

    const userDetails: IFullUserDetails = await UserService.getLoggedInUser({
        force: false,
    });

    await UserService.getRcBrandInfo({ force: false });

    const permissions = await UserService.getPermissions({
        force: false,
        portalType,
    });

    routes.RingSense = await Navigation.getRingSenseUrl();
    routes.Admin = Navigation.getAdminUrl();
    routes.Analytics = Navigation.getAnalyticsUrl();

    /** TODO: This redirect logic is hard-coded and actually shouldn't be here.
     * But we can't implement it in the right project right now.
     * So we placed it in here until we'll find a better solution. */
    if (permissions.Agent) {
        const agentId =
            userDetails.agentDetails?.length === 1
                ? userDetails.agentDetails[0].agentId
                : undefined;

        routes.Agent = await Navigation.getAgentUrl(agentId);
    }
    return [permissions, routes];
};
