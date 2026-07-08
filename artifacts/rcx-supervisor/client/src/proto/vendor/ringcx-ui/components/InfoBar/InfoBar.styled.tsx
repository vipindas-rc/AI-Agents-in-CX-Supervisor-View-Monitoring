import { alpha } from '@material-ui/core/styles';
import type { DefaultTheme } from '@mui/styled-engine';
import styled from 'styled-components';

import type { IInfoBarProps } from './types';
import { matchTypeToColor } from '../../helpers/colors';
import { NotificationTypes } from '../constants/Notifications';

const matchTypeToColorForInfoBar = (
    theme: DefaultTheme,
    type?: IInfoBarProps['type']
) => {
    switch (type) {
        case NotificationTypes.INFO:
            return theme.colors.gray[700];
        case NotificationTypes.ERROR:
        case NotificationTypes.SUCCESS:
        case NotificationTypes.WARNING:
            return matchTypeToColor(theme, type);
        default:
            return matchTypeToColor(theme, NotificationTypes.WARNING);
    }
};

export const InfoBarStyled = styled.div<IInfoBarProps>`
    box-sizing: border-box;
    background-color: ${({ theme, type }) =>
        alpha(matchTypeToColorForInfoBar(theme, type), 0.1)};
    position: relative;
    width: 100%;
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: ${({ theme }) => theme.font.size.base};
    line-height: 20px;
    padding: 14px 22px;
    letter-spacing: 0.25px;
    cursor: default;
    overflow-wrap: break-word;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 6px;
        height: 100%;
        border-bottom-left-radius: 4px;
        border-top-left-radius: 4px;
        background-color: ${({ theme, type }) =>
            matchTypeToColorForInfoBar(theme, type)};
    }
`;
