export type MultiPhoneInputProps = {
    label: string;
    value: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
    message?: string;
    error?: boolean;
    size?: 'small' | 'medium';
    autoFocus?: boolean;
    disabled?: boolean;
    required?: boolean;
    maxRows?: number;
    rowHeight?: number;
};
