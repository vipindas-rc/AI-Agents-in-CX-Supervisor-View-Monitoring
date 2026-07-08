export function isElectronPlatform() {
    return window.navigator.userAgent.toLowerCase().includes(' electron/');
}
