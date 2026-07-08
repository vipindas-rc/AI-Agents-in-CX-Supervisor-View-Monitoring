import { type FC } from 'react';

import { useSalesforcePopRecords } from './hooks/useSalesforcePopRecords';
import { ParamsType, CRMPlatform } from '../../../constants/crm';
import injector from '../../../helpers/injector';
import { CommonCallLogContainer } from '../SN_SF_ZH/CommonCallLogContainer';
import { CommonMessageLogContainer } from '../SN_SF_ZH/CommonMessageLogContainer';
import { useCommonMatchRecords } from '../SN_SF_ZH/hooks/useCommonMatchRecords';
import type { CommonLogContainerProps } from '../SN_SF_ZH/types';

export const SalesforceLogContainer: FC<CommonLogContainerProps> = (props) => {
    const { engageInfo, disabled, engageType } = props;
    const CrmSvc = injector('CrmSvc');
    const recordTypeGroups = CrmSvc.getRecordTypeGroups();

    const {
        isMatched,
        matchedNameItems,
        matchedRelatedToItems,
        reloadMatchedList,
    } = useCommonMatchRecords(
        engageType!,
        engageInfo,
        disabled,
        CRMPlatform.Salesforce
    );

    return props.engageType === ParamsType.Call ? (
        <CommonCallLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            customRelatedToFields={recordTypeGroups?.relatedTo}
            customNameFields={recordTypeGroups?.name}
            platform={CRMPlatform.Salesforce}
            usePopRecords={useSalesforcePopRecords}
            reloadMatchedList={reloadMatchedList}
            {...props}
        />
    ) : (
        <CommonMessageLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            customRelatedToFields={recordTypeGroups?.relatedTo}
            customNameFields={recordTypeGroups?.name}
            platform={CRMPlatform.Salesforce}
            reloadMatchedList={reloadMatchedList}
            {...props}
        />
    );
};
