import { type FC } from 'react';

import {
    SN_NAME_FIELD_OBJ,
    SN_RELATED_FIELD_OBJ,
    SnCallLoggingType,
} from './constants';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { ParamsType, CRMPlatform } from '../../../constants/crm';
import { CommonCallLogContainer } from '../SN_SF_ZH/CommonCallLogContainer';
import { CommonMessageLogContainer } from '../SN_SF_ZH/CommonMessageLogContainer';
import { useCommonMatchRecords } from '../SN_SF_ZH/hooks/useCommonMatchRecords';
import type { CommonLogContainerProps } from '../SN_SF_ZH/types';

export const ServiceNowLogContainer: FC<CommonLogContainerProps> = (props) => {
    const { engageInfo: currentCall, disabled, engageType } = props;
    const CrmSvc = useAngularModule('CrmSvc');

    const {
        isMatched,
        matchedNameItems,
        matchedRelatedToItems,
        reloadMatchedList,
    } = useCommonMatchRecords(
        engageType!,
        currentCall,
        disabled,
        CRMPlatform.ServiceNow
    );

    return props.engageType === ParamsType.Call ? (
        <CommonCallLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            platform={CRMPlatform.ServiceNow}
            customNameFields={
                SN_NAME_FIELD_OBJ[
                    (CrmSvc.integrateInfo
                        ?.callLoggingType as SnCallLoggingType) ||
                        SnCallLoggingType.INTERACTION
                ]
            }
            customRelatedToFields={
                SN_RELATED_FIELD_OBJ[
                    (CrmSvc.integrateInfo
                        ?.callLoggingType as SnCallLoggingType) ||
                        SnCallLoggingType.INTERACTION
                ]
            }
            reloadMatchedList={reloadMatchedList}
            {...props}
        />
    ) : (
        <CommonMessageLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            platform={CRMPlatform.ServiceNow}
            reloadMatchedList={reloadMatchedList}
            {...props}
        />
    );
};
