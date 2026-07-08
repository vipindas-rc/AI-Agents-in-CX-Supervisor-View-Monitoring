import styled from 'styled-components';

interface IVerticalAlignWrapper {
    justifyContent?: string;
}

export const VerticalAlignWrapper = styled.div<IVerticalAlignWrapper>`
    display: flex;
    justify-content: ${(p) => p.justifyContent};

    & > * {
        align-self: center;
    }
`;
