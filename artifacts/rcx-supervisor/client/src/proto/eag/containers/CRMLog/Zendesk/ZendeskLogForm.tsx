import type { FC } from 'react';
import {
    useMemo,
    useEffect,
    useState,
    useContext,
    useCallback,
    useRef,
} from 'react';

import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

import { RecordType, NAME_FIELD } from './constants';
import { useEngageInfoChanged } from './hooks/useEngageInfoChanged';
import { useIconCreator } from './hooks/useIconCreator';
import { useZendeskTicketLogic } from './hooks/useZendeskTicketLogic';
import type {
    IZendeskLogFormData,
    IZendeskLogFormProps,
    ZendeskTicket,
} from './types';
import { StyledLinkButton } from './ZendeskLogForm.styled';
import { DataTrackingEventNames } from '../../../components/CRM/constants';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { useCreateFields } from '../../../components/CRM/Hooks/useCreateFields';
import { useDataTracking } from '../../../components/CRM/Hooks/useDataTracking';
import {
    CRMLogForm,
    CRMMatchField,
    CRMSubjectField,
    CRMMatchSelect,
    CRMFormField,
} from '../../../components/CRM/LogForm';
import type { MatchItem } from '../../../components/CRM/types';
import {
    CRM_SELECT_USER,
    CRM_CREATE_TICKET,
    CRM_USER_MATCHED_LABEL,
} from '../../../constants/testIds';
import injector from '../../../helpers/injector';
import { LogKindContext } from '../../../helpers/logKind';

function isSameFormData(
    prevFormData: IZendeskLogFormData,
    nextFormData: IZendeskLogFormData
) {
    return (
        prevFormData.subject === nextFormData.subject &&
        prevFormData.user?.id === nextFormData.user?.id &&
        prevFormData.user?.name === nextFormData.user?.name &&
        prevFormData.user?.type === nextFormData.user?.type &&
        prevFormData.ticket?.id === nextFormData.ticket?.id &&
        prevFormData.ticket?.subject === nextFormData.ticket?.subject &&
        prevFormData.ticket?.userId === nextFormData.ticket?.userId &&
        prevFormData.ticket?.url === nextFormData.ticket?.url &&
        prevFormData.user_shouldShowGrayMatchResultTip ===
            nextFormData.user_shouldShowGrayMatchResultTip
    );
}

export const ZendeskLogForm: FC<IZendeskLogFormProps> = ({
    disabled,
    matchedUsers,
    selectedTicket,
    hyperlinkType,
    selectSize = 'small',
    formData,
    engageInfo,
    onFormDataChanged,
    resetHyperlinkType,
    engageType,
    onEngageInfoChanged,
    isLoading,
}) => {
    const [isSearchDetailOpen, setIsSearchDetailOpen] = useState(false);
    const formDataRef = useRef(formData);
    const onFormDataChangedRef = useRef(onFormDataChanged);
    const hasSyncedInitialFormDataRef = useRef(false);
    const iconCreator = useIconCreator();
    const CrmSvc = useAngularModule('CrmSvc');
    const { t } = useTranslation();

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        onFormDataChangedRef.current = onFormDataChanged;
    }, [onFormDataChanged]);

    const updateFormData = useCallback(
        (nextFormData: IZendeskLogFormData, options?: { force?: boolean }) => {
            const currentFormData = formDataRef.current;
            if (
                !options?.force &&
                isSameFormData(currentFormData, nextFormData)
            ) {
                return;
            }
            formDataRef.current = nextFormData;
            onFormDataChangedRef.current(nextFormData);
        },
        []
    );

    useDataTracking({
        isMatched: !isLoading,
        peopleMatchedItems: matchedUsers,
    });

    const { createFields, handleCreateRecord } = useCreateFields(
        NAME_FIELD,
        engageInfo
    );

    useEngageInfoChanged(formData, matchedUsers, onEngageInfoChanged);

    const handleFormDataChanged = (val: any) => {
        const currentFormData = formDataRef.current;
        const userVal = val.user;
        let user = currentFormData.user;
        if (userVal) {
            if (Array.isArray(userVal)) {
                user = {
                    id: userVal[0]?.id || '',
                    name: userVal[0]?.name || '',
                    type: userVal[0]?.type || '',
                };
            } else {
                user = userVal;
            }
        }
        updateFormData({
            ...currentFormData,
            ...val,
            user,
        });
    };

    const handleShowSearchDetail = useCallback(() => {
        setIsSearchDetailOpen(true);
    }, []);

    const handleCloseSearchDetail = useCallback(() => {
        resetHyperlinkType?.();
        setIsSearchDetailOpen(false);
    }, [resetHyperlinkType]);

    useEffect(() => {
        if (!hasSyncedInitialFormDataRef.current) {
            updateFormData(formData, { force: true });
            hasSyncedInitialFormDataRef.current = true;
        }
        if (
            disabled ||
            isLoading ||
            (formData?.user && formData?.user?.id !== undefined)
        ) {
            return;
        }
        // to see whether it's first single match rather user's operate
        if (matchedUsers.length === 1) {
            updateFormData({
                ...formData,
                user: matchedUsers[0],
            });
        } else if (matchedUsers.length > 1) {
            const currentUser = matchedUsers.find((user) => user.isCurrent);
            if (currentUser) {
                updateFormData({ ...formData, user: currentUser });
            }
        }
    }, [
        isLoading,
        matchedUsers,
        disabled,
        formData?.user?.id,
        formData,
        updateFormData,
    ]);

    const selectedUser = useMemo(() => {
        const defaultName =
            typeof formData.user !== 'undefined'
                ? formData.user.id !== ''
                    ? formData.user
                    : null
                : null;
        return defaultName ? [defaultName] : [];
    }, [formData.user]);

    const logKind = useContext(LogKindContext);
    const { matchedTickets, handleCreateTicket: createTicketAndSelect } =
        useZendeskTicketLogic({
            CrmSvc,
            engageInfo,
            engageType,
            formData,
            formDataRef,
            updateFormData,
            selectedTicket,
            isSearchDetailOpen,
            isDigitalLogVisible: logKind?.visible,
        });

    const matchedTicketsData = useMemo(() => {
        return matchedTickets.map(({ id, subject, url }: ZendeskTicket) => ({
            id,
            name: `#${id} ${subject}`,
            url,
        }));
    }, [matchedTickets]);

    const handleCreateUser = async () => {
        handleCreateRecord(
            RecordType.User,
            undefined,
            engageInfo,
            (user: MatchItem) => {
                updateFormData({ ...formDataRef.current, user });
            }
        );
    };

    const handleCreateTicket = async () => {
        const AnalyticsSvc = injector('AnalyticsSvc');
        AnalyticsSvc.track(DataTrackingEventNames.RCXMatchCreate, {
            method: logKind?.logKindType,
            type: RecordType.Ticket,
        });
        await createTicketAndSelect();
    };

    const debouncedSubmit = useMemo(
        () =>
            debounce(() => {
                if (engageInfo.uii) {
                    const currentFormData = formDataRef.current;
                    try {
                        CrmSvc.submitCallLogWithCallback({
                            type: engageType,
                            uii: engageInfo.uii,
                            zendeskLogInfo: {
                                ...currentFormData,
                                displayName:
                                    currentFormData?.user?.id &&
                                    currentFormData?.user?.name,
                            },
                        });
                    } catch (error) {
                        console.error(
                            'submit call log with callback error',
                            error
                        );
                    }
                }
            }, 500),
        [CrmSvc, engageInfo.uii, engageType]
    );

    useEffect(() => {
        debouncedSubmit();
        return () => {
            debouncedSubmit.cancel();
        };
    }, [debouncedSubmit, formData]);

    return (
        <CRMLogForm
            disabled={disabled}
            onFormDataChanged={handleFormDataChanged}
            formData={formData}
        >
            <CRMSubjectField value={formData.subject} />
            <CRMMatchField
                label={t('CRM.ZENDESK.USER')}
                placeholder={t('CRM.ZENDESK.USER_SELECT_PLACEHOLDER')}
                searchType='name'
                formDataKey='user'
                autoPopSearchDetail={!!hyperlinkType}
                selectedItems={selectedUser}
                matchedItems={matchedUsers}
                platFormTranslateKey='ZENDESK'
                createFields={createFields}
                iconCreator={iconCreator}
                onCreateRecord={handleCreateUser}
                onShowSearchDetail={handleShowSearchDetail}
                onCloseSearchDetail={handleCloseSearchDetail}
                tipAid={CRM_USER_MATCHED_LABEL}
                fieldAid={CRM_SELECT_USER}
                engageType={engageType}
                engageInfo={engageInfo}
            />
            {formData.user?.id && (
                <CRMFormField
                    label={t('CRM.ZENDESK.TICKET')}
                    action={
                        !disabled ? (
                            <StyledLinkButton
                                underline='always'
                                title={t('CRM.ZENDESK.NEW_TICKET')}
                                onClick={handleCreateTicket}
                                data-aid={CRM_CREATE_TICKET}
                                disabled={!engageInfo.uii}
                                component='button'
                            />
                        ) : null
                    }
                >
                    <CRMMatchSelect
                        type={RecordType.Ticket}
                        listData={matchedTicketsData}
                        platFormTranslateKey='ZENDESK'
                        size={selectSize}
                    />
                </CRMFormField>
            )}
        </CRMLogForm>
    );
};
