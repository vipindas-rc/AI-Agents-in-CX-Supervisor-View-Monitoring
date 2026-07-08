import { useEffect, useMemo, useState, type FC, Fragment } from 'react';

import { Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { useLogFormContext } from './CRMLogFormContext';
import {
    CRM_NAME_MATCHED_LABEL,
    CRM_SELECT_NAME,
} from '../../../constants/testIds';
import injector from '../../../helpers/injector';
import {
    CRMMatchResultField,
    CRMMatchResultLabel,
    CRMMatchResultTip,
    ArrowRight,
} from '../CRMMatchResult/CRMMatchResult.styled';
import { CRMSearchDetail } from '../CRMMatchResult/CRMSearchDetail/CRMSearchDetail';
import { useGrayMatchResultTip } from '../Hooks/useGrayMatchResultTip';
import type { ICreateFieldsProps, MatchItem, IEngageInfo } from '../types';

export interface CRMMatchFieldProps {
    autoPopSearchDetail?: boolean;
    label: string;
    labelAid?: string;
    fieldAid?: string;
    placeholder: string;
    disabled?: boolean;
    formDataKey: string;
    selectedItems?: MatchItem[];
    matchedItems: MatchItem[];
    createFields: ICreateFieldsProps[];
    platFormTranslateKey: string;
    searchType?: string;
    engageType?: string;
    engageInfo?: IEngageInfo;
    onChange?: (data: MatchItem[]) => void;
    onCreateRecord: (type: string) => void;
    onShowSearchDetail?: () => void;
    onCloseSearchDetail?: () => void;
    iconCreator?: (item: MatchItem) => JSX.Element;
    isShowSelectedItemsNumber?: boolean;
    tipAid?: string;
    searchValidation?: (value?: string) => boolean;
    reloadMatchedList?: () => void;
}

export const CRMMatchField: FC<CRMMatchFieldProps> = ({
    autoPopSearchDetail = false,
    label,
    labelAid,
    placeholder,
    disabled = false,
    formDataKey,
    selectedItems = [],
    matchedItems = [],
    createFields,
    platFormTranslateKey,
    searchType,
    onChange,
    onCreateRecord,
    onShowSearchDetail,
    onCloseSearchDetail,
    iconCreator,
    isShowSelectedItemsNumber = false,
    fieldAid = CRM_SELECT_NAME,
    tipAid = CRM_NAME_MATCHED_LABEL,
    reloadMatchedList,
    searchValidation,
    engageType,
    engageInfo,
}) => {
    const CrmSvc = injector('CrmSvc');
    const { t } = useTranslation();
    const {
        disabled: formDisabled,
        formData,
        onFormDataChanged,
    } = useLogFormContext();
    const [shouldShowSearchDetail, setShouldShowSearchDetail] = useState(false);
    const _shouldShowGrayMatchResultTip = useGrayMatchResultTip(
        formData[`${formDataKey}_shouldShowGrayMatchResultTip`],
        matchedItems
    );

    const isDisabled = formDisabled || disabled;

    const handleShowSearchDetail = () => {
        if (isDisabled) {
            return;
        }
        setShouldShowSearchDetail(true);
        onFormDataChanged?.({
            [`${formDataKey}_shouldShowGrayMatchResultTip`]: true,
        });
        onShowSearchDetail?.();
    };

    const handleCloseSearchDetail = () => {
        setShouldShowSearchDetail(false);
        onCloseSearchDetail?.();
    };

    const handleMultiSelect = (selectedItems: MatchItem[]) => {
        onChange?.(selectedItems);
        onFormDataChanged?.({ [formDataKey]: selectedItems });
    };

    const selectedNames = useMemo(() => {
        return selectedItems.length > 0
            ? t('CRM.COMMON.SELECTED_INPUT_TEXT', {
                  name: selectedItems[0].name,
                  count: selectedItems.length,
              })
            : placeholder;
    }, [selectedItems, t, placeholder]);

    useEffect(() => {
        if (autoPopSearchDetail && !isDisabled) {
            handleShowSearchDetail();
        }
    }, [autoPopSearchDetail, isDisabled]);

    return (
        <Fragment>
            <CRMMatchResultLabel data-aid={labelAid}>
                {label}
                {selectedItems.length > 0 &&
                    isShowSelectedItemsNumber &&
                    ` (${selectedItems.length}) `}
                {matchedItems.length > 0 && (
                    <CRMMatchResultTip
                        data-aid={tipAid}
                        gray={_shouldShowGrayMatchResultTip}
                    >
                        {t('CRM.COMMON.MATCHES_FOUND', {
                            count: matchedItems.length,
                        })}
                    </CRMMatchResultTip>
                )}
            </CRMMatchResultLabel>
            <CRMMatchResultField
                disabled={isDisabled}
                onClick={handleShowSearchDetail}
                data-aid={fieldAid}
            >
                <Tooltip
                    title={selectedNames}
                    PopperProps={{
                        modifiers: {
                            flip: {
                                enabled: true,
                            },
                            offset: {
                                offset: '0, 0',
                            },
                        },
                        style: { maxWidth: '284px' },
                    }}
                >
                    <span>{selectedNames}</span>
                </Tooltip>
                {!isDisabled && <ArrowRight />}
            </CRMMatchResultField>
            {shouldShowSearchDetail && (
                <CRMSearchDetail
                    show={true}
                    type={searchType}
                    CrmSvc={CrmSvc}
                    CRMPlatform={t(`CRM.PLATFORM.${platFormTranslateKey}`)}
                    platFormTranslateKey={platFormTranslateKey}
                    matchedList={matchedItems}
                    selectedItems={selectedItems}
                    handleMultiSelect={handleMultiSelect}
                    handleClose={handleCloseSearchDetail}
                    createFields={createFields}
                    handleCreate={onCreateRecord}
                    iconCreator={iconCreator}
                    searchValidation={searchValidation}
                    engageType={engageType}
                    formDataKey={formDataKey}
                    uii={
                        engageInfo?.leadId ||
                        engageInfo?.lead?.leadId ||
                        engageInfo?.uii ||
                        ''
                    }
                    reloadMatchedList={reloadMatchedList}
                />
            )}
        </Fragment>
    );
};
