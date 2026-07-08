import type { FC } from 'react';

import parse from 'html-react-parser';
import { useTranslation } from 'react-i18next';

import { StyledSystemInstruction } from './MicrophoneAccessInstructions.styled';
import type { ISystemInstruction } from '../types';

export const SystemInstruction: FC<ISystemInstruction> = ({ content }) => {
    const { t } = useTranslation();
    return (
        <StyledSystemInstruction>
            {content.map((instruction) => (
                <div key={instruction}>{parse(t(instruction))}</div>
            ))}
        </StyledSystemInstruction>
    );
};
