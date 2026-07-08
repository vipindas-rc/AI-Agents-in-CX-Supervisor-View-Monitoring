import type { ReactNode } from 'react';

export interface IInstruction {
    title: string;
    content: ReactNode;
}

export interface IInstructionList {
    isNumeric: boolean;
    instructions: string[];
}

export interface ISystemInstruction {
    content: string[];
}

export interface IStyledList {
    isNumeric?: boolean;
}
