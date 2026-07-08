import ArrowDropDownRounded from '@material-ui/icons/ArrowDropDownRounded';
import styled, { css } from 'styled-components';

export const StyledArrow = styled(ArrowDropDownRounded)`
    && {
        position: absolute;
        top: -4px;
        left: -8px;
        transform: rotate(-90deg);
        transition: all ease 200ms;
    }
`;

export const StyledCaption = styled.div`
    position: relative;
    font-size: 12px;
    font-weight: 500;
    height: 16px;
    line-height: 16px;
    letter-spacing: 0.4px;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    color: ${(p) => p.theme.colors.primary};
    padding-left: 12px;
`;

export const StyledSubtitle = styled.div`
    font-size: 12px;
    font-weight: normal;
    height: 16px;
    letter-spacing: 0;
    line-height: 16px;
    user-select: none;
    color: ${(p) => p.theme.colors.gray[700]};
`;

export const StyledContent = styled.div``;

export const StyledCollapse = styled.div<{ expanded: boolean }>`
    border-bottom: 1px solid ${(p) => p.theme.colors.gray[100]};

    ${({ expanded }) =>
        expanded &&
        css`
            ${StyledCaption} {
                ${StyledArrow} {
                    transform: rotate(0deg);
                }
            }
            ${StyledContent} {
                padding: 16px 0 24px 0;
            }
        `}

    ${({ expanded }) =>
        !expanded &&
        css`
            ${StyledCaption} {
                margin-bottom: 6px;
            }
            ${StyledSubtitle} {
                margin-bottom: 8px;
            }
        `}
`;
