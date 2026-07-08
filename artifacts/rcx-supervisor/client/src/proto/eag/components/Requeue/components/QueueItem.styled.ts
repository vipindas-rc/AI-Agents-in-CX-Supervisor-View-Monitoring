import { Icon } from '@ringcentral/spring-ui';
import styled from 'styled-components';

export const MetricsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: var(--sui-spacing-6, 20px);
    padding-right: var(--sui-spacing-6, 20px);
`;

export const WaitTimeWrapper = styled.div`
    display: flex;
    align-items: center;
    flex: 1 0 55%;
    min-width: 138px;
`;

export const WaitTimeContent = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--sui-spacing-1, 4px);
    width: fit-content;
`;

export const AgentCountWrapper = styled.div`
    flex: 1 0 45%;
    margin-left: var(--sui-spacing-2, 8px);
`;

export const AgentCountDescriptor = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--sui-spacing-1, 4px);
    width: fit-content;
`;

export const SelectedIconWrapper = styled(Icon)`
    color: var(--sui-colors-primary-b, #066fac);
`;

export const StyledIcon = styled(Icon)`
    & path:last-child {
        fill: var(--sui-colors-neutral-b4, #dddfe5);
    }
`;
