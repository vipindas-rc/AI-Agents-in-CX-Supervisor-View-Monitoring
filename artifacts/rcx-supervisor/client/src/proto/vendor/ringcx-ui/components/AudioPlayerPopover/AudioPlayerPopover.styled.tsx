import { Slider } from '@material-ui/core';
import styled from 'styled-components';

import IconButton from '../IconButton';

export const StyledAudioPlayerPopover = styled.div`
    display: flex;
`;

export const SliderStyled = styled(Slider)`
    min-width: 200px;
    padding-top: 24px !important;

    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        min-width: 78px;
    }
`;

export const AudioTimeStyled = styled.span`
    width: 155px;
    height: 20px;
    line-height: 20px;
    padding-top: 15px;
    padding-bottom: 15px;
`;

export const ToggleBtnStyled = styled(IconButton)<{ disabled: boolean }>`
    i {
        font-size: 30px;
        color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[700] : theme.colors.primary};
    }
`;
