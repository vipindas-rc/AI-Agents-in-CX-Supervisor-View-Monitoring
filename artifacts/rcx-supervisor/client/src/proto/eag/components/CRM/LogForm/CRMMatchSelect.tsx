import type { FC } from 'react';
import { useCallback, useMemo } from 'react';

import type { IDropDownData } from '@ringcx/ui';
import { DisplayVariantType } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { useLogFormContext } from './CRMLogFormContext';
import * as testIds from '../../../constants/testIds';
import { CRMMatchResultSelect } from '../CRMMatchResult/CRMMatchResult.styled';
import { StyledSingleSelect } from '../CRMMatchResult/styled';
import { useAngularModule } from '../Hooks/useAngularModule';
import type { ICRMMatchSelectProps } from '../types';

export const CRMMatchSelect: FC<ICRMMatchSelectProps> = ({
    type,
    listData,
    platFormTranslateKey,
    size = 'small',
    formDataKey,
    loading,
    disabled,
    onOpen,
}) => {
    const { t } = useTranslation();
    const CrmSvc = useAngularModule('CrmSvc');
    const {
        disabled: formDisabled,
        formData,
        onFormDataChanged,
    } = useLogFormContext();

    const handleChange = (id: string) => {
        const item = listData.find((item) => item.id === id);
        onFormDataChanged({
            ...formData,
            [formDataKey || type.toLowerCase()]: item,
        });
    };

    const handleOpenSelection = useCallback(() => {
        onOpen?.(type);
    }, [onOpen, type]);

    const selectList: IDropDownData = useMemo(() => {
        return {
            items: listData.map(({ id, name, url }) => ({
                id: id || '',
                displayName: name || '',
                variant: {
                    tooltipMsg: t(`CRM.${platFormTranslateKey}.VIEW_RECORD`),
                    type: DisplayVariantType.Hyperlink,
                    dataAid: (testIds as any)[
                        `CRM_SELECT_${type.toUpperCase()}`
                    ],
                    onClick: () => {
                        CrmSvc.openRecord({
                            type,
                            params: id,
                            url,
                        });
                    },
                },
            })),
        };
    }, [CrmSvc, listData, platFormTranslateKey, t, type]);

    return (
        <CRMMatchResultSelect>
            <StyledSingleSelect
                loading={loading}
                onOpen={handleOpenSelection}
                disabled={disabled || formDisabled}
                data={selectList}
                useDefaultSort={false}
                onChange={handleChange}
                isSearchable
                error={false}
                title=''
                message=''
                size={size}
                selectedItemId={
                    formData?.[formDataKey || type.toLowerCase()]?.id || ''
                }
                enableClearButton={!(disabled || formDisabled)}
                visibleItemsCount={4}
                placeholder={t(
                    `CRM.${platFormTranslateKey}.${type.toUpperCase()}_SELECT_PLACEHOLDER`
                )}
                nothingAvailableText={t(
                    `CRM.${platFormTranslateKey}.${type.toUpperCase()}_NO_RESULTS`
                )}
                noResultsFoundText={t(
                    `CRM.${platFormTranslateKey}.${type.toUpperCase()}_NO_RESULTS`
                )}
                dataAid={(testIds as any)[`CRM_SELECT_${type.toUpperCase()}`]}
            />
        </CRMMatchResultSelect>
    );
};
