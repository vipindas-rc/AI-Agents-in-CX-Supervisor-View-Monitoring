import { Autocomplete } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import type { MultiInputProps } from './types';
import { themeV4toV5 } from '../../../theme/theme';

//TODO: this is not used anywhere, we need to remove it
const MultiInput = ({ ...props }: MultiInputProps) => {
    return (
        <ThemeProvider theme={themeV4toV5}>
            <Autocomplete multiple freeSolo options={[]} {...props} />
        </ThemeProvider>
    );
};

export default MultiInput;
