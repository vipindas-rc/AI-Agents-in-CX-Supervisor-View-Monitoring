import styled from 'styled-components';

interface IVisuallyHiddenLabel {
    htmlFor: string;
    children: React.ReactNode;
}

const StyledLabel = styled.label`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
`;

export const VisuallyHiddenLabel = ({
    htmlFor,
    children,
}: IVisuallyHiddenLabel) => (
    <StyledLabel htmlFor={htmlFor}>{children}</StyledLabel>
);
