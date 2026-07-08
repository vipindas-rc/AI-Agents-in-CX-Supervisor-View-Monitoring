import { type FC } from 'react';

import { ParamsType, CRMPlatform } from '../../../constants/crm';
import { CommonCallLogContainer } from '../SN_SF_ZH/CommonCallLogContainer';
import { CommonMessageLogContainer } from '../SN_SF_ZH/CommonMessageLogContainer';
import { useCommonMatchRecords } from '../SN_SF_ZH/hooks/useCommonMatchRecords';
import type { CommonLogContainerProps } from '../SN_SF_ZH/types';

export const ZohoLogContainer: FC<CommonLogContainerProps> = (props) => {
    const { engageInfo: currentCall, disabled, engageType } = props;

    const {
        isMatched,
        matchedNameItems,
        matchedRelatedToItems,
        reloadMatchedList,
    } = useCommonMatchRecords(
        engageType!,
        currentCall,
        disabled,
        CRMPlatform.Zoho
    );

    return props.engageType === ParamsType.Call ? (
        <CommonCallLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            platform={CRMPlatform.Zoho}
            reloadMatchedList={reloadMatchedList}
            {...props}
        />
    ) : (
        <CommonMessageLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            platform={CRMPlatform.Zoho}
            reloadMatchedList={reloadMatchedList}
            {...props}
        />
    );
};
