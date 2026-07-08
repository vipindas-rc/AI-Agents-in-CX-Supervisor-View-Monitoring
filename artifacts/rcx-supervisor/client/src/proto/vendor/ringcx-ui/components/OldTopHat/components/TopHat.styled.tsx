import styled from 'styled-components';

import { matchTypeToColor } from '../../../helpers';
import type { INotificationType } from '../../constants/types';

interface ITopHatProps extends INotificationType {
    open: boolean;
}

export const CtaButton = styled.span`
    padding-top: 12px;
    padding-left: 10px;
    font-weight: 500;
    user-select: none;

    &:hover {
        text-decoration: underline;
        cursor: pointer;
    }
    &:focus {
        text-decoration: underline;
    }
    i {
        margin-left: 4px;
        font-size: 12px;
    }
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        text-decoration: underline;
        padding-left: 5px;
        font-weight: 700;
    }
`;
export const CloseButton = styled.span`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    top: 8px;
    right: 8px;
    &:hover {
        cursor: pointer;
    }
`;

export const TopHatStyled = styled.div<ITopHatProps>`
    position: relative;
    // @ts-ignore
    background: ${({ type, theme }) => matchTypeToColor(theme, type)};
    text-align: center;
    color: white;
    font-weight: 300;
    cursor: default;
    top: 0;
    width: 100%;
    max-width: 100%;
    height: ${(p) => (p.open ? '48' : '0')}px;
    line-height: 48px;
    padding-right: 48px;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        font-weight: 400;
        height: auto;
        min-height: ${(p) => (p.open ? '30' : '0')}px;
        line-height: 20px;
        padding: 5px;
        font-size: 12px;
    }

    span {
        white-space: normal;
    }
`;
