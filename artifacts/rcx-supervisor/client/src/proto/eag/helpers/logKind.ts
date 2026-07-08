import { createContext } from 'react';

export const enum LogKindType {
    VOICE = 'VOICE',
    DIGITAL = 'DIGITAL',
}

export type LogKindObject = {
    logKindType: LogKindType;
    visible: boolean;
};

export const LogKindContext = createContext<LogKindObject | null>(null);
