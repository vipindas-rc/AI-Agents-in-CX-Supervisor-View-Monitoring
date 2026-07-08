import injector from './injector';
import { isElectronPlatform } from './platform';

export async function getDisplayCount(): Promise<number | null> {
    if (isElectronPlatform()) {
        const JupiterService = injector('JupiterService');
        const screenIds = await JupiterService.requestScreenIds();
        return screenIds.length;
    }

    const { state } = await navigator.permissions.query({
        name: 'window-management' as PermissionName,
    });

    if (state === 'granted') {
        const displayDetails = await window.getScreenDetails();
        return displayDetails.screens.length;
    }

    return null;
}
