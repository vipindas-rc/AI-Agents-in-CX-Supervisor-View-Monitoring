import { useEffect, type FC } from 'react';

import { useDynamicsPopRecords } from './hooks/useDynamicsPopRecords';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { ParamsType, CRMPlatform } from '../../../constants/crm';
import { CommonCallLogContainer } from '../SN_SF_ZH/CommonCallLogContainer';
import { CommonMessageLogContainer } from '../SN_SF_ZH/CommonMessageLogContainer';
import { useCommonMatchRecords } from '../SN_SF_ZH/hooks/useCommonMatchRecords';
import type { CommonLogContainerProps } from '../SN_SF_ZH/types';

export const DynamicsLogContainer: FC<CommonLogContainerProps> = (props) => {
    const {
        engageInfo: currentCall,
        disabled,
        engageType,
        initialFormData,
        isScreenPopInHistory = false,
    } = props;
    const CrmSvc = useAngularModule('CrmSvc');

    const isMatchCrmVersion = CrmSvc.matchCrmVersion('25.4.2');

    useEffect(() => {
        if (
            isScreenPopInHistory &&
            (initialFormData?.name?.id || initialFormData?.relatedTo?.id)
        ) {
            CrmSvc.popRecords({
                type:
                    initialFormData?.name?.type ||
                    initialFormData?.relatedTo?.type,
                params:
                    initialFormData?.name?.id || initialFormData?.relatedTo?.id,
            });
        }
    }, []);

    const {
        isMatched,
        matchedNameItems,
        matchedRelatedToItems,
        reloadMatchedList,
    } = useCommonMatchRecords(
        engageType!,
        currentCall,
        disabled,
        CRMPlatform.Dynamics365
    );

    return props.engageType === ParamsType.Call ? (
        <CommonCallLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            platform={CRMPlatform.Dynamics365}
            usePopRecords={useDynamicsPopRecords}
            reloadMatchedList={
                isMatchCrmVersion ? reloadMatchedList : undefined
            }
            {...props}
        />
    ) : (
        <CommonMessageLogContainer
            isMatched={isMatched}
            matchedNameItems={matchedNameItems}
            matchedRelatedToItems={matchedRelatedToItems}
            platform={CRMPlatform.Dynamics365}
            reloadMatchedList={
                isMatchCrmVersion ? reloadMatchedList : undefined
            }
            {...props}
        />
    );
};
