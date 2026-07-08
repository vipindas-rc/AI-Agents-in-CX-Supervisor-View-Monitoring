import styled from 'styled-components';

import { Doc } from '../../icons/Doc';
import { Button } from '../Button';
import IconButton from '../IconButton';
import LinkButton from '../LinkButton';
import { TextEclipse } from '../TextEclipse';

export const HiddenInput = styled.input`
    &&& {
        display: none;
    }
`;

export const Label = styled.label`
    vertical-align: top;
`;

export const UploadedFile = styled.div`
    display: flex;
    align-items: center;
    padding-right: 6px;
    border-radius: 4px;
    height: 42px;
    background-color: ${({ theme }) => theme.colors.gray[50]};
    color: ${({ theme }) => theme.colors.gray[900]};
    font-weight: 500;

    svg:first-child {
        font-size: 16px;
        margin-right: 8px;
    }
`;

export const UploadedFilesStatus = styled.div`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[800]};
    padding: 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const StyledTextEclipse = styled(TextEclipse)`
    width: 100%;
    font-weight: 500;
    letter-spacing: 0.15px;
    flex: 1;
    line-height: 20px;
`;

export const StyledDoc = styled(Doc)`
    margin-left: 12px;
    margin-right: 6px;
    font-size: 15px;
`;

export const StyleLinkButton = styled(LinkButton)`
    && {
        justify-content: flex-start;
        text-decoration: none;
    }
`;

export const StyledIconButton = styled(IconButton)`
    && {
        color: ${({ theme }) => theme.colors.gray[700]};
    }
`;

export const StyledDeleteButton = styled(Button)`
    && {
        color: ${({ theme }) => theme.colors.primary};
        font-weight: 500;
    }
`;
