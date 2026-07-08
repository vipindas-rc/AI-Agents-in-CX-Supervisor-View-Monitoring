import styled from 'styled-components';

export const StyledListGroupHeader = styled.div`
    font-size: 16px;
    font-weight: normal;
    letter-spacing: 0.17px;
    line-height: 24px;
    padding-bottom: 8px;
`;
export const StyledListGroupContent = styled.ul<{ listLength: number }>`
    display: grid;
    grid-template-columns: ${(props) =>
        `repeat(${Math.min(props.listLength, 3)}, 1fr)`};
    margin: 0;
    padding: 0;
`;
