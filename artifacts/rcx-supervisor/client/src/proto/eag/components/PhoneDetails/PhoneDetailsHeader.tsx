import type { FC } from 'react';

import { HeaderTabs } from './HeaderTabs';
import { PhoneHeaderWrapper } from './PhoneDetails.styled';
import type { IPhoneDetailsHeader } from './types/PhoneDetails';
import { PHONE_DETAILS_HEADER } from '../../constants/testIds';
import translate from '../../helpers/translate';
import { PhoneHeaderPanel } from '../../layout/CallDetails/components/PhoneHeaderPanel';

export const PhoneDetailsHeader: FC<IPhoneDetailsHeader> = ({
    withScript,
    isAgentPageAvailable,
    selectedTabIndex = 0,
    onTabChange,
    showExpendBtn,
    isPanelOpen,
    setIsPanelOpen,
}) => {
    const title = (
        <HeaderTabs
            defaultTitle={translate('RIGHT_PANEL.TABS.DETAIL')}
            isAgentScriptAvailable={withScript}
            isAgentPageAvailable={isAgentPageAvailable}
            selectedTabIndex={selectedTabIndex}
            onTabChange={onTabChange}
        />
    );
    return (
        <PhoneHeaderWrapper
            // do not remove this id because it is used to position the frame correctly
            id='phoneDetailsHeader'
            data-aid={PHONE_DETAILS_HEADER}
        >
            <PhoneHeaderPanel
                title={title}
                showExpendBtn={showExpendBtn}
                isPanelOpen={isPanelOpen}
                setIsPanelOpen={setIsPanelOpen}
            />
        </PhoneHeaderWrapper>
    );
};
