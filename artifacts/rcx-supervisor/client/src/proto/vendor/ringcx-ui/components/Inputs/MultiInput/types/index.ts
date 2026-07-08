import type { AutocompleteProps } from '@mui/material';

export type MultiInputProps = Omit<
    AutocompleteProps<string, true, false, true>,
    'options'
>;
