import { isNonUSInternationalPhone } from './utils';

export interface PhonePersistenceLead {
    ani?: string;
    aniE164?: string;
    destination?: string;
    leadId?: string;
    [key: string]: unknown;
}

interface OutboundService {
    findPreviewLeadById(leadId: string): PhonePersistenceLead | undefined;
}

interface SessionService {
    isI18nEnabled(): boolean;
}

export function resolveLead(
    baggage: PhonePersistenceLead | undefined,
    fallbackLead: PhonePersistenceLead | undefined,
    OutboundSvc: OutboundService,
    SessionSvc: SessionService
): PhonePersistenceLead {
    if (!baggage) {
        return {};
    }

    let lead = baggage;
    lead.destination = lead.ani;

    if (baggage.leadId) {
        const foundLead = OutboundSvc.findPreviewLeadById(baggage.leadId);
        if (foundLead) {
            lead = Object.assign(baggage, foundLead);
        } else if (fallbackLead?.leadId) {
            lead = Object.assign(baggage, fallbackLead);
        }
    }

    const isI18nEnabled = SessionSvc.isI18nEnabled();
    if (
        lead.aniE164 &&
        (isI18nEnabled || isNonUSInternationalPhone(lead.aniE164))
    ) {
        lead.destination = lead.aniE164;
    }

    return lead;
}
