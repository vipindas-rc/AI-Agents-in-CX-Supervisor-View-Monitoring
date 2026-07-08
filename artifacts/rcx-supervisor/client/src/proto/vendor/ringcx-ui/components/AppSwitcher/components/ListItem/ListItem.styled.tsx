import { alpha } from '@material-ui/core/styles';
import styled from 'styled-components';

export const StyledListItem = styled.li`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    text-decoration: none;
    color: ${({ theme }) => theme.colors.gray[900]};
    padding-top: 8px;
    padding-bottom: 10px;
    padding-right: 10px;
    max-width: 155px;
    position: relative;
    list-style: none;
`;

export const StyledListItemLink = styled.a`
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 48px;
    height: 48px;
    box-sizing: border-box;
    border-radius: 10px;
    margin-bottom: 8px;
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    place-content: center;
    align-items: center;
    border: 1.4px solid ${({ theme }) => theme.colors.gray[200]};
    color: currentColor;

    &:hover {
        border-color: transparent;
        box-shadow: 0px 2px 6px 0px ${alpha('#000', 0.24)};
    }

    /* Need !important to override global *:focus { box-shadow: none !important } rule */
    &:focus {
        outline: none !important;
        border-color: transparent;
        box-shadow: 0px 2px 6px 0px ${alpha('#000', 0.24)} !important;
    }

    &:active {
        box-shadow: 0px 2px 4px 0px ${alpha('#000', 0.24)};
    }
`;
export const StyledListItemTitle = styled.div`
    font-size: 12px;
    letter-spacing: 0.4px;
    line-height: 16px;
    padding: 0 5px;
    width: 100%;
    overflow-wrap: break-word;
`;

export const SpinnerWrapper = styled.div`
    position: absolute;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    background: ${({ theme }) => theme.colors.gray[100]};
    opacity: 0.5;
    border-radius: 10px;
`;
