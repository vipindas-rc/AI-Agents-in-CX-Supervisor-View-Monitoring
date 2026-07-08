export const TRANSFER_DESTINATION_TYPE = {
    INTERNAL: '1',
    CORPORATE_DIRECTORY: '2',
    PHONEBOOK: '3',
    DESTINATION: '4',
} as const;

export type TransferDestinationType =
    (typeof TRANSFER_DESTINATION_TYPE)[keyof typeof TRANSFER_DESTINATION_TYPE];
