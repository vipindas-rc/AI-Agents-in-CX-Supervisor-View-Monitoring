import type { TextInputSizes } from './TextInput';

interface IStyledTextInput {
    disabled: boolean;
    inputSize: TextInputSizes;
    'data-aid'?: string;
    'aria-label'?: string;
}

export default IStyledTextInput;
