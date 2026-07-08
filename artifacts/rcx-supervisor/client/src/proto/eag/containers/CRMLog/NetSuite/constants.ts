export enum RecordType {
    LEAD = 'Lead',
    PROSPECT = 'Prospect',
    EMPLOYEE = 'Employee',
    CUSTOMER = 'Customer',
    VENDOR = 'Vendor',
    PARTNER = 'Partner',
    OTHERNAME = 'OtherName',
    CONTACT = 'Contact',
    SUPPORTCASE = 'SupportCase',
    OPPORTUNITY = 'Opportunity',
    TRANSACTION = 'Transaction',
}

export enum LinkedRecordType {
    CONTACT = 'contact',
    SUPPORTCASE = 'supportCase',
    TRANSACTION = 'transaction',
}

export const SupportedCompanyMap = {
    [LinkedRecordType.CONTACT]: [
        RecordType.LEAD,
        RecordType.PROSPECT,
        RecordType.CUSTOMER,
        RecordType.VENDOR,
        RecordType.PARTNER,
        RecordType.OTHERNAME,
    ],
    [LinkedRecordType.SUPPORTCASE]: [
        RecordType.LEAD,
        RecordType.PROSPECT,
        RecordType.CUSTOMER,
        RecordType.PARTNER,
    ],
    [LinkedRecordType.TRANSACTION]: [
        RecordType.LEAD,
        RecordType.PROSPECT,
        RecordType.CUSTOMER,
    ],
};
