import { useEffect, useCallback, useState, useRef } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import type { MatchItem } from '../../../../components/CRM/types';
import { CRM_ACTIONS } from '../../../../constants/crm';
import { crmEventBus } from '../../../../helpers/crmEventBus';
import { LinkedRecordType, RecordType } from '../constants';
import type { FormData } from '../types';

interface UpdatedCallMatchRecordsData {
    uii: string;
    lastCreatedName?: MatchItem;
    lastCreatedContact?: MatchItem;
    lastCreatedSupportCase?: MatchItem;
    lastCreatedTransaction?: MatchItem;
    records?: MatchItem[];
}

interface MatchedRecords {
    matchedNames: MatchItem[];
    matchedContact: MatchItem | null;
    matchedSupportCase: MatchItem | null;
    matchedTransaction: MatchItem | null;
}

interface RecentlyCreatedRecords {
    recentlyCreatedName?: MatchItem;
    recentlyCreatedContact?: MatchItem;
    recentlyCreatedSupportCase?: MatchItem;
    recentlyCreatedTransaction?: MatchItem;
}

interface UpdatedLinkedRecords {
    contact?: MatchItem;
    supportCase?: MatchItem;
    transaction?: MatchItem;
}

const getResolvedCompanyTypes = (companyTypes: string[], CrmSvc: any) =>
    companyTypes.length > 0
        ? companyTypes
        : CrmSvc.getRecordTypeGroups?.()?.name || [];

const getMatchedRecords = (
    records: MatchItem[],
    resolvedCompanyTypes: string[]
): MatchedRecords => ({
    matchedNames: records.filter(
        (item) => item.type && resolvedCompanyTypes.includes(item.type)
    ),
    matchedContact:
        records.find((item) => item.type === RecordType.CONTACT) || null,
    matchedSupportCase:
        records.find((item) => item.type === RecordType.SUPPORTCASE) || null,
    matchedTransaction:
        records.find(
            (item) =>
                item.type === RecordType.OPPORTUNITY ||
                item.type === RecordType.TRANSACTION
        ) || null,
});

const getRecentlyCreatedRecords = ({
    matchedNames,
    matchedContact,
    matchedSupportCase,
    matchedTransaction,
}: MatchedRecords): RecentlyCreatedRecords => ({
    recentlyCreatedName: matchedNames.find((item) => item.recentlyCreated),
    recentlyCreatedContact: matchedContact?.recentlyCreated
        ? matchedContact
        : undefined,
    recentlyCreatedSupportCase: matchedSupportCase?.recentlyCreated
        ? matchedSupportCase
        : undefined,
    recentlyCreatedTransaction: matchedTransaction?.recentlyCreated
        ? matchedTransaction
        : undefined,
});

const normalizeCompanyId = (companyId?: string) =>
    companyId?.includes('_') ? companyId.split('_')[1] : companyId;

const getRelatedCompanyIds = (company?: MatchItem['company']) =>
    typeof company === 'string' ? company.split(',') : [];

const getUpdatedLinkedRecords = (
    {
        recentlyCreatedContact,
        recentlyCreatedSupportCase,
        recentlyCreatedTransaction,
    }: RecentlyCreatedRecords,
    currentCompanyId?: string
): UpdatedLinkedRecords => {
    const normalizedCurrentCompanyId = normalizeCompanyId(currentCompanyId);

    if (!normalizedCurrentCompanyId) {
        return {};
    }

    return {
        contact:
            recentlyCreatedContact &&
            getRelatedCompanyIds(recentlyCreatedContact.company).includes(
                normalizedCurrentCompanyId
            )
                ? recentlyCreatedContact
                : undefined,
        supportCase:
            recentlyCreatedSupportCase?.company === normalizedCurrentCompanyId
                ? recentlyCreatedSupportCase
                : undefined,
        transaction:
            recentlyCreatedTransaction?.company === normalizedCurrentCompanyId
                ? recentlyCreatedTransaction
                : undefined,
    };
};

const hasUpdatedLinkedRecords = ({
    contact,
    supportCase,
    transaction,
}: UpdatedLinkedRecords) => Boolean(contact || supportCase || transaction);

const updateFormDataWithMatchedRecords = (
    currentFormData: FormData,
    lastCreatedName: MatchItem | undefined,
    recentlyCreatedName: MatchItem | undefined,
    updatedLinkedRecords: UpdatedLinkedRecords,
    handleFormDataChanged: (formData: FormData) => void
) => {
    // Only skip when this recently created company was already applied to the current form state.
    const shouldApplyRecentlyCreatedName =
        recentlyCreatedName &&
        (!lastCreatedName ||
            recentlyCreatedName.id !== lastCreatedName.id ||
            recentlyCreatedName.id !== currentFormData.company?.id);

    if (shouldApplyRecentlyCreatedName && recentlyCreatedName) {
        const shouldClearRelatedFields =
            recentlyCreatedName.id !== currentFormData.company?.id;

        handleFormDataChanged({
            ...currentFormData,
            company: recentlyCreatedName,
            [LinkedRecordType.CONTACT]: shouldClearRelatedFields
                ? undefined
                : currentFormData[LinkedRecordType.CONTACT],
            [LinkedRecordType.SUPPORTCASE]: shouldClearRelatedFields
                ? undefined
                : currentFormData[LinkedRecordType.SUPPORTCASE],
            [LinkedRecordType.TRANSACTION]: shouldClearRelatedFields
                ? undefined
                : currentFormData[LinkedRecordType.TRANSACTION],
        });

        return;
    }

    if (!hasUpdatedLinkedRecords(updatedLinkedRecords)) {
        return;
    }

    handleFormDataChanged({
        ...currentFormData,
        [LinkedRecordType.CONTACT]:
            updatedLinkedRecords.contact ||
            currentFormData[LinkedRecordType.CONTACT],
        [LinkedRecordType.SUPPORTCASE]:
            updatedLinkedRecords.supportCase ||
            currentFormData[LinkedRecordType.SUPPORTCASE],
        [LinkedRecordType.TRANSACTION]:
            updatedLinkedRecords.transaction ||
            currentFormData[LinkedRecordType.TRANSACTION],
    });
};

export function useUpdateMatchRecords(
    uii: string,
    formData: FormData,
    disabled: boolean,
    companyTypes: string[],
    handleFormDataChanged: (formData: FormData) => void
) {
    const [updatedSelectedContactItem, setUpdatedSelectedContactItem] =
        useState<MatchItem | null>(null);
    const [updatedSelectedSupportCaseItem, setUpdatedSelectedSupportCaseItem] =
        useState<MatchItem | null>(null);
    const [updatedSelectedTransactionItem, setUpdatedSelectedTransactionItem] =
        useState<MatchItem | null>(null);
    const [isRecordUpdated, setIsRecordUpdated] = useState(false);

    const CrmSvc = useAngularModule('CrmSvc');
    const handleFormDataChangedRef = useRef(handleFormDataChanged);
    const formDataRef = useRef(formData);

    useEffect(() => {
        handleFormDataChangedRef.current = handleFormDataChanged;
    }, [handleFormDataChanged]);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const [updatedMatchedNameItems, setUpdatedMatchedNameItems] = useState<
        MatchItem[]
    >([]);

    const handler = useCallback(
        (data: UpdatedCallMatchRecordsData) => {
            if (disabled) {
                return;
            }

            if (data.uii !== uii) {
                return;
            }

            const resolvedCompanyTypes = getResolvedCompanyTypes(
                companyTypes,
                CrmSvc
            );

            if (!resolvedCompanyTypes.length) {
                return;
            }

            const matchedRecords = getMatchedRecords(
                data.records || [],
                resolvedCompanyTypes
            );
            const { matchedNames } = matchedRecords;
            const {
                recentlyCreatedName,
                recentlyCreatedContact,
                recentlyCreatedSupportCase,
                recentlyCreatedTransaction,
            } = getRecentlyCreatedRecords(matchedRecords);
            const updatedLinkedRecords = getUpdatedLinkedRecords(
                {
                    recentlyCreatedContact,
                    recentlyCreatedSupportCase,
                    recentlyCreatedTransaction,
                },
                formDataRef.current.company?.id
            );
            const {
                contact: updatedContact,
                supportCase: updatedSupportCase,
                transaction: updatedTransaction,
            } = updatedLinkedRecords;

            setUpdatedMatchedNameItems(matchedNames);
            setUpdatedSelectedContactItem(updatedContact || null);
            setUpdatedSelectedSupportCaseItem(updatedSupportCase || null);
            setUpdatedSelectedTransactionItem(updatedTransaction || null);
            setIsRecordUpdated(true);

            updateFormDataWithMatchedRecords(
                formDataRef.current,
                data.lastCreatedName,
                recentlyCreatedName,
                updatedLinkedRecords,
                handleFormDataChangedRef.current
            );

            CrmSvc.setUpdatedCallMatchRecords(uii, {
                records: undefined,
                ...(recentlyCreatedName
                    ? {
                          lastCreatedName: recentlyCreatedName,
                      }
                    : {}),
            });
        },
        [uii, companyTypes, disabled, CrmSvc]
    );

    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventHandler = (data: UpdatedCallMatchRecordsData) => {
            handlerRef.current(data);
        };

        crmEventBus.on(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, eventHandler);
        return () => {
            crmEventBus.off(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, eventHandler);
        };
    }, []);

    useEffect(() => {
        const updatedCallMatchRecordsData = CrmSvc.updatedCallMatchRecords[uii];
        const resolvedCompanyTypes =
            companyTypes.length > 0
                ? companyTypes
                : CrmSvc.getRecordTypeGroups?.()?.name || [];

        if (
            updatedCallMatchRecordsData?.records &&
            resolvedCompanyTypes.length
        ) {
            handlerRef.current(updatedCallMatchRecordsData);
        }
    }, [uii, CrmSvc, companyTypes]);

    const resetIsRecordUpdated = useCallback(() => {
        setIsRecordUpdated(false);
        setUpdatedMatchedNameItems([]);
        setUpdatedSelectedContactItem(null);
        setUpdatedSelectedSupportCaseItem(null);
        setUpdatedSelectedTransactionItem(null);
    }, []);

    return {
        updatedMatchedNameItems,
        updatedSelectedContactItem,
        updatedSelectedSupportCaseItem,
        updatedSelectedTransactionItem,
        isRecordUpdated,
        resetIsRecordUpdated,
    };
}
