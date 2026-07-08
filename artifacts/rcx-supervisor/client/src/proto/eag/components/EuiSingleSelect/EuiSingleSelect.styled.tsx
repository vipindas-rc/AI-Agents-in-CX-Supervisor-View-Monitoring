import { SingleSelect, DropDownBorder, StyledToggle } from '@ringcx/ui';
import styled from 'styled-components';

export const StyledEuiSingleSelect = styled(SingleSelect)`
    ${DropDownBorder} {
        border: 1px solid var(--eui-select-border);
        ${StyledToggle} {
            height: 32px;
        }
    }
`;
