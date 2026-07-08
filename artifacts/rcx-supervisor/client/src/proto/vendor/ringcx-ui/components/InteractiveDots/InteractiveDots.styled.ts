import styled, { keyframes } from 'styled-components';

const DEFAULT_DOT_DIMENSION = 1.8;
const WIDTH_IN_BETWEEN = 1.5;
const dotsLoadingAnimation = keyframes`
        to{
           background-color:transparent;
        }

`;
export const StyledInteractiveDots = styled.span<{
    dotsDimension?: string;
    color?: string;
}>`
   position:relative;

    & > span {
        width: ${({ dotsDimension }) =>
            dotsDimension ?? DEFAULT_DOT_DIMENSION + 'px'};
        height: ${({ dotsDimension }) =>
            dotsDimension ?? DEFAULT_DOT_DIMENSION + 'px'};
        border-radius: 50%;
        background-color: ${({ theme, color }) =>
            color ?? theme.colors.gray[700]};
        position: absolute;
        bottom: 4px;
        left: 1px;
        animation: ${dotsLoadingAnimation}  0.8s infinite alternate;
        

    &:nth-child(2){
        animation-delay: 0.2s;
        margin-left:${({ dotsDimension }) =>
            dotsDimension ?? DEFAULT_DOT_DIMENSION * WIDTH_IN_BETWEEN + 'px'}
    }
    &:nth-child(3){
        animation-delay: 0.4s;
        margin-left:${({ dotsDimension }) =>
            dotsDimension ??
            DEFAULT_DOT_DIMENSION * WIDTH_IN_BETWEEN * 2 + 'px'}
    }
`;
