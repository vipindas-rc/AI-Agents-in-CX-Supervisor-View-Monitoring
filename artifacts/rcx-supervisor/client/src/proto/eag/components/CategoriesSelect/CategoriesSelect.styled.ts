import styled from 'styled-components';

export const StyledCategoriesSelectWrapper = styled.div`
    .MuiInputBase-root.MuiOutlinedInput-root {
        padding-top: 4px;
        padding-bottom: 4px;
    }

    && {
        & .MuiOutlinedInput-root {
            input {
                padding: 0;
            }
        }
    }
`;
