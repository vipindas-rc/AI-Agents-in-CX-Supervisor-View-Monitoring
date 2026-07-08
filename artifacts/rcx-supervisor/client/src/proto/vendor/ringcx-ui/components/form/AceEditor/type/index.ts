import type { ControllerRenderProps } from 'react-hook-form';

export interface IEditor extends ControllerRenderProps {
    mode: 'json' | 'xml' | 'text';
    error?: boolean;
}
