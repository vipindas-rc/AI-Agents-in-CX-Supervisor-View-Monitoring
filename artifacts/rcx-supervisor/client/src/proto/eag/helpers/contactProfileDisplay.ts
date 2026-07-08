import type { ContactsInfo } from '../common/services/transport';
import { AttributesItemKind } from '../common/services/transport';

export const getPhoneLookupKey = (phoneNumber: string | null | undefined) =>
    phoneNumber?.replace(/\D/g, '') || '';

export const getContactProfileDisplayName = (
    profile: ContactsInfo | null | undefined
) => {
    const attributes = profile?.attributes || [];
    const getAttributeValue = (kind: AttributesItemKind) => {
        const value = attributes.find(
            (attribute) => attribute.kind === kind && attribute.value
        )?.value;

        return typeof value === 'string' ? value.trim() : '';
    };
    const firstName = getAttributeValue(AttributesItemKind.FirstName);
    const lastName = getAttributeValue(AttributesItemKind.LastName);

    return [firstName, lastName].filter(Boolean).join(' ');
};
