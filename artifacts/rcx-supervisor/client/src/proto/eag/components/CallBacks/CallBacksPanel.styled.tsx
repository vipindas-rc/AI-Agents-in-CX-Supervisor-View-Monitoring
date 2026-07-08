import { IconButton, Segments } from '@ringcx/ui';
import styled from 'styled-components';

import { CardContent } from '../Card/Card.styled';

export const CallBackContainer = styled.div`
    background: #f2f2f2;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
`;

export const CallBacksSegmentWrap = styled.div`
    padding-bottom: 10px;
`;

export const CallBacksHeader = styled.div`
    font-size: 16px;
    font-weight: 500;
    padding: 5px 0 0 10px;
`;
export const NoCallBacksText = styled.p`
    font-size: 16px;
    font-weight: 500;
    text-align: center;
`;

export const CallBackDetails = styled.div.attrs((props: any) => ({
    className: `${props.leadClass}`,
}))<{ leadClass: string }>`
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.gray[0]};
    margin-bottom: 5px;
    height: 65px;
    padding: 10px;
`;

export const CallBackHeader = styled.div`
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    margin-bottom: 5px;
`;

export const CallBackContentContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const CallBackListContainer = styled.div``;

export const CallBackContent = styled.div`
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 25px;
`;

export const CallBackActions = styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    color: ${({ theme }) => theme.colors.primary};

    .MuiButtonBase-root {
        margin: -8px;
        color: ${({ theme }) => theme.colors.primary};
    }

    .MuiIconButton-label {
        font-size: 18px;
    }
`;

export const StyledButton = styled(IconButton)`
    && {
        padding: 8px;
        width: 40px;
        height: 40px;
        color: ${({ theme }) => theme.colors.primary};

        .MuiButtonBase-root {
            margin: -8px;
            color: ${({ theme }) => theme.colors.primary};
        }

        .MuiIconButton-label {
            font-size: 23px;
        }
    }
`;

export const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    color: ${({ theme }) => theme.colors.gray[0]};
    font-weight: 400;
    background-color: ${({ theme }) => theme.colors.primary};
    width: 100%;
    border: none;
`;

export const StyledSegments = styled(Segments)`
    background: none;
`;

export const StyledCardContent = styled(CardContent)`
    overflow-y: auto;
    flex: 1;
    padding: 0 10px;
`;

export const Divider = styled.hr`
    margin-top: 2px;
    margin-bottom: 5px;
    background-color: ${({ theme }) => theme.colors.gray[200]};
    height: 1px;
`;

export const CallBackBtn = styled.div`
    width: 100%;
    position: sticky;
    bottom: 0;
    left: 0;
    border-top: 1px @legend-border-color solid;
    padding: 12px;
    height: 70px;
`;

export const CallBackBtnDetails = styled.div`
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
`;
