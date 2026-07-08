import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import {
    InstructionContainer,
    InstructionTitle,
} from './MicrophoneAccessInstructions.styled';
import type { IInstruction } from '../types';

export const Instruction: FC<IInstruction> = ({ title, content }) => {
    const { t } = useTranslation();
    return (
        <InstructionContainer>
            <InstructionTitle>{t(title)}</InstructionTitle>
            {content}
        </InstructionContainer>
    );
};
