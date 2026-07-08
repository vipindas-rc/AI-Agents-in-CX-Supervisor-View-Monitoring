import styled from 'styled-components';

export const StyledCategoriesAutoCompleteWrapper = styled.div`
    .MuiInputBase-root.MuiOutlinedInput-root {
        padding: 4px 40px 4px 12px;
    }

    && {
        & .MuiOutlinedInput-root {
            input {
                padding: 0;
            }
        }
    }
`;
