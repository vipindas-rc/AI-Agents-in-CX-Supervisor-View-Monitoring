import { useCallback, useState, useEffect, useMemo } from 'react';

import { Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import {
    AddIcon,
    AddButton,
} from '../../../../components/CRM/CRMMatchResult/CRMMatchResult.styled';
import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import { CRMFormField } from '../../../../components/CRM/LogForm/CRMFormField';
import { useLogFormContext } from '../../../../components/CRM/LogForm/CRMLogFormContext';
import { CRMMatchSelect } from '../../../../components/CRM/LogForm/CRMMatchSelect';
import type { MatchItem } from '../../../../components/CRM/types';
import { CRM_CREATE_MENU_BUTTON } from '../../../../constants/testIds';
import { SupportedCompanyMap } from '../constants';
import type { INetSuiteLinkedRecordProps } from '../types';

export const NetSuiteLinkedRecord = ({
    type,
    selectedItem,
    formDataKey,
    createType,
    handleCreateRecord,
}: INetSuiteLinkedRecordProps) => {
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<MatchItem[]>([]);
    const CrmSvc = useAngularModule('CrmSvc');
    const { formData, disabled } = useLogFormContext();
    const { t } = useTranslation();

    const isCompanySupported = useMemo(() => {
        return SupportedCompanyMap[formDataKey].includes(
            formData.company?.type
        );
    }, [formData.company?.type, formDataKey]);

    useEffect(() => {
        setList(formData[formDataKey] ? [formData[formDataKey]] : []);
    }, [formData.company.id]);

    useEffect(() => {
        if (!selectedItem) {
            return;
        }

        setList((previousList) => {
            if (previousList.some((item) => item.id === selectedItem.id)) {
                return previousList;
            }

            return [selectedItem, ...previousList];
        });
    }, [selectedItem]);

    const handleCreate = () => {
        handleCreateRecord(createType || type, {
            company: formData.company,
        });
    };

    const getListData = useCallback(
        async (type: string) => {
            try {
                const result = await CrmSvc.searchContacts({
                    params: formData?.company || {},
                    type,
                });
                setList(result.records);
            } catch (error) {
                setList([]);
            }
        },
        [CrmSvc, formData?.company]
    );

    const openSelection = useCallback(
        async (type: string) => {
            setLoading(true);
            await getListData(type);
            setLoading(false);
        },
        [getListData]
    );

    return (
        <CRMFormField
            label={t(`CRM.NETSUITE.${type.toUpperCase()}`)}
            action={
                !disabled && isCompanySupported ? (
                    <Tooltip
                        title={t('CRM.NETSUITE.NEW_SELECTION', {
                            selection: t(
                                `CRM.NETSUITE.FIELD.${(
                                    createType || type
                                ).toUpperCase()}`
                            ),
                        })}
                    >
                        <AddButton
                            data-aid={`${CRM_CREATE_MENU_BUTTON}_${type.toLowerCase()}`}
                            onClick={handleCreate}
                            aria-label={t('CRM.NETSUITE.NEW_SELECTION', {
                                selection: t(
                                    `CRM.NETSUITE.FIELD.${(
                                        createType || type
                                    ).toUpperCase()}`
                                ),
                            })}
                        >
                            <AddIcon />
                        </AddButton>
                    </Tooltip>
                ) : null
            }
        >
            <CRMMatchSelect
                disabled={!isCompanySupported}
                loading={loading}
                listData={list}
                formDataKey={formDataKey}
                type={type}
                platFormTranslateKey='NETSUITE'
                onOpen={openSelection}
                size='small'
            />
        </CRMFormField>
    );
};
