const modernCopy = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        return false;
    }
};

const obsoleteCopy = async (text: string): Promise<boolean> => {
    if (!(typeof document.execCommand === 'function')) {
        return false;
    }

    let element: HTMLElement | null = null;
    let result = false;

    try {
        element = document.createElement('span');
        const selection = document.getSelection();

        element.innerText = text;
        document.body.appendChild(element);

        if (selection) {
            selection.selectAllChildren(element);
        }

        result = document.execCommand('copy');
    } catch (e) {
        // Do nothing;
    } finally {
        if (element) {
            element.remove();
        }
    }

    return result;
};

export const isCopyAllowed = async (): Promise<boolean> => {
    // As default we guess that clipboard copy is allowed in all modern and access granted
    let isAllowed = true;

    // Check the copy permission if Permission API is available
    if (window.navigator.permissions) {
        try {
            const state: PermissionStatus =
                await window.navigator.permissions.query({
                    name: 'clipboard-write' as PermissionName,
                });

            isAllowed = state.state === 'granted';
        } catch (e) {
            // Do nothing
            // E.g. FF isn't support check permission 'clipboard-write' but access to copy is granted
        }
    }

    return isAllowed;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    return (await modernCopy(text)) || (await obsoleteCopy(text));
};
