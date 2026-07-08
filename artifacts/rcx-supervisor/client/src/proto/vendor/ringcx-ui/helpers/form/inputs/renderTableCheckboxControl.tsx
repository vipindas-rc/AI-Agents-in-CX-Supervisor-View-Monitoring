import { StyledTableCheckbox } from '../../../components/form/Checkbox/Checkbox.styled';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import type { RHFControllerRender } from '../../../types';

export const renderTableCheckboxControl = ({
    glId,
    id,
    disabled,
    dataAid,
    role = 'none',
}: {
    glId: string;
    id?: string;
    disabled?: boolean;
    dataAid?: string;
    role?: string;
}): RHFControllerRender => {
    return ({ field }) => {
        const { value, disabled: fieldDisabled, ...rest } = field;

        return (
            <StyledTableCheckbox
                id={id || glId}
                {...rest}
                disabled={disabled || fieldDisabled}
                checked={value === INDETERMINATE_FIELD_VALUE ? false : !!value}
                indeterminate={value === INDETERMINATE_FIELD_VALUE}
                role={role}
                data-aid={dataAid}
            />
        );
    };
};
