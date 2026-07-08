import styled from 'styled-components';

import type { IStyledList } from '../types';

export const MicrophoneAccessInstructionsContainer = styled.div`
    gap: 32px;
    display: flex;
    flex-direction: column;
`;

export const InstructionContainer = styled.div`
    gap: 12px;
    display: flex;
    font-size: 14px;
    flex-direction: column;
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        font-size: 12px;
    }
`;

export const InstructionTitle = styled.div`
    font-size: 16px;
    font-weight: 500;
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        font-size: 14px;
    }
`;

export const StyledList = styled.ul<IStyledList>`
    margin: 0;
    padding-left: 20px;
    list-style: ${({ isNumeric }) => (isNumeric ? 'decimal' : 'disc')};
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        padding-left: 16px;
    }
`;

export const StyledSystemInstruction = styled.div`
    gap: 4px;
    display: flex;
    flex-direction: column;
`;
