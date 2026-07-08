import styled from 'styled-components';

export const CssGridContainerStyled = styled.div<{ columns: number }>`
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
    margin: 10px auto;
`;
