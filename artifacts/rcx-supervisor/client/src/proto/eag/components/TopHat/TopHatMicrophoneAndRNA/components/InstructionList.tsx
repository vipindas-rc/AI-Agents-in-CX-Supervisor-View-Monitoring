import type { FC } from 'react';

import parse from 'html-react-parser';
import { useTranslation } from 'react-i18next';

import { StyledList } from './MicrophoneAccessInstructions.styled';
import type { IInstructionList } from '../types';

export const InstructionList: FC<IInstructionList> = ({
    instructions,
    isNumeric,
}) => {
    const { t } = useTranslation();
    return (
        <StyledList isNumeric={isNumeric}>
            {instructions.map((instruction, index) => (
                <li key={`instruction-${index}`}>{parse(t(instruction))}</li>
            ))}
        </StyledList>
    );
};
