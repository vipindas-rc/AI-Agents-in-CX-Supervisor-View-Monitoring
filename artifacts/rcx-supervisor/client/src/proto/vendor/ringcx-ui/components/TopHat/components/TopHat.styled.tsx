import styled from 'styled-components';

import { matchTypeToColor } from '../../../helpers';
import type { INotificationType } from '../../constants/types';

export const CtaButton = styled.span`
    padding-top: 12px;
    padding-left: 10px;
    font-weight: 500;
    user-select: none;

    &:hover {
        span {
            text-decoration: underline;
        }
        cursor: pointer;
    }
    i {
        margin-left: 4px;
        font-size: 12px;
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

export const TopHatStyled = styled.div<INotificationType>`
    position: relative;
    background: ${({ type, theme }) => matchTypeToColor(theme, type)};
    text-align: center;
    color: white;
    font-weight: 300;
    cursor: default;
    top: 0;
    width: 100%;
    max-width: 100%;
    height: 48px;
    line-height: 48px;
    padding-right: 48px;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;

    span {
        white-space: normal;
    }
`;
