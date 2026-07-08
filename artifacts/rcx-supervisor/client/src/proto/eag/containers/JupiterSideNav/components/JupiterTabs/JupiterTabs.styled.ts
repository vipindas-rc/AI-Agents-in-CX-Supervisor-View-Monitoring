import { palette2, RcTab, RcTabs } from '@ringcentral/juno';
import { styled } from 'styled-components';

export const StyledRcTab = styled(RcTab)`
    font-size: 14px;

    &.RcTab-selected {
        font-size: 14px;
    }
`;

export const StyledRcTabs = styled(RcTabs)`
    border-bottom: 1px solid ${palette2('neutral', 'l02')};
`;
