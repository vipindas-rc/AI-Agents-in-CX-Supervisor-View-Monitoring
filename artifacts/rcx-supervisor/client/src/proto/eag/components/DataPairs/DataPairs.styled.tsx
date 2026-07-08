import { AudioPlayerPopover } from '@ringcx/ui';
import styled from 'styled-components';

import { device } from '../../constants/breakpoints';

export const DataPairsStyled = styled.div`
    display: flex;
    max-width: 450px;
    width: calc(50% - 12px);
    min-width: 330px;
    flex-direction: row;
    padding-top: 10px;
    padding-bottom: 10px;
    @media ${device.crm} {
        width: auto;
        min-width: auto;
    }
`;

export const LabelStyled = styled.span`
    hyphens: auto;
    width: 120px;
    margin-right: 10px;
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 20px;
    color: ${({ theme }) => theme.colors.gray[800]};
    word-break: normal;
    overflow-wrap: anywhere;
    flex-shrink: 0;
    @media ${device.crm} {
        font-size: 12px;
        width: 100px;
        margin-right: 5px;
    }
`;

export const ValueStyled = styled.span`
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 20px;
    word-break: break-all;
    display: block;
    width: 65%;
    @media ${device.crm} {
        font-size: 12px;
    }
`;

export const StyledAudioPlayerPopover = styled(AudioPlayerPopover)`
    .MuiPopover-paper {
        box-shadow: 0 2px 12px 0 rgba(173, 173, 173, 0.5) !important;
        '&:focus, &:active': {
            box-shadow: 0 2px 12px 0 rgba(173, 173, 173, 0.5) !important;
        }

        @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
            padding: 18px 6px 18px 0px;
            width: calc(100% - 12px);
            font-size: 12px;
            left: 6px !important;
        }
    }
`;
