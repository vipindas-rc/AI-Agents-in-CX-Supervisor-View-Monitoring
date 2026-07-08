import { Button } from '@ringcx/ui';
import styled from 'styled-components';

const MAX_TEXT_WIDTH = 672;

export const EmptyWrapper = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: ${({ theme }) => theme.dimensions.contentMinWidth};
    padding: 154px 24px 40px;
    width: 100%;
    /* justify-content: center; */
`;

export const EmptyIconWrapper = styled.div`
    & > svg {
        display: block;
    }
`;

export const EmptyTitle = styled.div`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 22px;
    padding-top: 30px;
    text-align: center;
    max-width: ${MAX_TEXT_WIDTH}px;
`;

export const EmptyDescription = styled.div`
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0.25px;
    line-height: 20px;
    padding-top: 12px;
    text-align: center;
    max-width: ${MAX_TEXT_WIDTH}px;
`;

export const EmptyButton = styled(Button)`
    && {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.15px;
        padding: 0 15px;
        margin-top: 20px;
    }
`;
