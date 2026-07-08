export function filterNullValue(value: string | number | undefined | null) {
    return value !== null &&
        value !== undefined &&
        value !== 'undefined' &&
        value !== 'null' &&
        value !== 0 &&
        value !== '0' &&
        value !== ''
        ? value
        : '—';
}

export function filterStrNullValue(value: string | undefined | null) {
    const val = value?.trim();
    return val !== null &&
        val !== undefined &&
        val !== 'undefined' &&
        val !== 'null' &&
        val !== '0' &&
        val !== '' &&
        !containsOnlySpecialCharacters(val)
        ? val
        : '—';
}

export function containsOnlySpecialCharacters(str: string) {
    return /^[–!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?~]+$/.test(str.trim());
}

export function toPercentWithDecimal(
    value: string | number | null | undefined,
    decimals: number
) {
    decimals = decimals ? decimals : 0;
    return !isNaN(Number(value))
        ? `${Number(value).toFixed(decimals)}%`
        : '0.00%';
}

export function getAgentState(
    currentAgentStateLabel: string,
    currentAgentBaseState: string
) {
    return filterNullValue(currentAgentStateLabel) !== '—'
        ? currentAgentStateLabel
        : currentAgentBaseState;
}

export function filterTime(strTime: string) {
    return strTime === '00:00:00' ? '—' : strTime;
}

export function isValidCallId(val: string | null | undefined) {
    return !!val && val !== 'null';
}

export function firstUpperCase(str: string) {
    return str[0].toUpperCase() + str.slice(1);
}

export function isNonUSInternationalPhone(phoneNumber: string) {
    return phoneNumber.startsWith('+') && !phoneNumber.startsWith('+1');
}

export function compareMainVersion(a: string, b: string) {
    const aArr = a?.split('-')[0]?.split('.');
    const bArr = b?.split('-')[0]?.split('.');
    const len = Math.max(aArr.length, bArr.length);
    for (let i = 0; i < len; i++) {
        const aNum = parseInt(aArr[i], 10) || 0;
        const bNum = parseInt(bArr[i], 10) || 0;
        if (aNum > bNum) {
            return 1;
        }
        if (aNum < bNum) {
            return -1;
        }
    }
    return 0;
}

export function parseJsonIfValid(text: any) {
    try {
        const res = JSON.parse(text);
        return res;
    } catch (e) {
        return null;
    }
}

export function generateTranscriptUrl(
    rcAccountId: string,
    subAccountId: string,
    dialogId: string,
    segmentId: string
) {
    const baseUrl = window.location.origin;
    if (!rcAccountId || !subAccountId || !dialogId || !segmentId || !baseUrl) {
        return '';
    }
    const transcriptUrl = `${baseUrl}/voice/api/v1/agent/cx/integration/v3/accounts/${rcAccountId}/sub-accounts/${subAccountId}/transcripts/dialogs/${dialogId}/segments/${segmentId}?format=text&style=crm`;
    return transcriptUrl;
}

export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const isCallPreviewPage = (pathName: string = '') =>
    pathName.includes('dialpad.preview') ||
    pathName.includes('interaction.phone.preview');
