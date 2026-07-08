import type { DigitalJWTModifier } from '@ringcx/shared';

export interface IInternalMessaging {
    agentId: string;
    digitalJWTModifier: DigitalJWTModifier;
}
