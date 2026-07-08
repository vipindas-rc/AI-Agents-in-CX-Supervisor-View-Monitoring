export function handleApiError(
    error: unknown,
    showError: (msg: string) => void,
    onRefreshToken?: () => void
) {
    if ((error as any)?._fromRefreshToken) {
        onRefreshToken?.();
        return;
    }

    const response = (error as any)?.response;
    if (typeof response === 'string') {
        try {
            const parsed = JSON.parse(response);
            if (
                parsed &&
                typeof parsed.message === 'string' &&
                parsed.message.trim()
            ) {
                showError(parsed.message);
                return;
            }
        } catch {
            /* ignore */
        }
    }

    if (
        response &&
        typeof response === 'object' &&
        typeof response.message === 'string' &&
        response.message.trim()
    ) {
        showError(response.message);
        return;
    }

    if (
        typeof (error as any)?.message === 'string' &&
        (error as any).message.trim()
    ) {
        showError((error as any).message);
    }
}
