/**
 * WS @do_not_call maps to doNotCall (agent-sdk utils). Values may be boolean
 * (after NEW-CALL processing) or "0" / "1" strings.
 */
export function isDoNotCallDisposition(
    disposition:
        | {
              doNotCall?: boolean | string;
          }
        | null
        | undefined
): boolean {
    const v = disposition?.doNotCall;
    return v === true || v === '1';
}
