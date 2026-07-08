import styled from 'styled-components';

export default styled.span<{ code: string; color?: string }>`
    font-family: 'digital-icons';
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    font-size: 16px;

    &::before {
        content: '${({ code }) => code}';
        color: ${({ color }) => (color ? color : 'inherit')};
        margin-right: 8px;
    }
`;
