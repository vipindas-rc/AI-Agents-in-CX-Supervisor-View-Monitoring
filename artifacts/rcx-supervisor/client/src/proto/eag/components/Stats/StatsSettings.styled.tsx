import { Tabs } from '@ringcentral/spring-ui';
import { Checkbox, TextEclipse } from '@ringcx/ui';
import styled, { css } from 'styled-components';

export const StatsSettingsContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export const StatsSettingsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    padding: 10px;
    flex-shrink: 0;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.15);
    & button {
        padding: 0;
        margin: 0;
        border: none;
        background: transparent;
        cursor: pointer;
    }
`;

export const StatsSettingsContent = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    &::-webkit-scrollbar {
        display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
`;

export const StatsSettingCheckboxList = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    flex-wrap: wrap;
    box-sizing: border-box;
`;

export const StatsSettingCheckboxContainer = styled.div`
    display: flex;
    padding: 10px 8px;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    flex: 0 0 calc(50% - 4px);
    border-radius: 4px;
    background: var(--sui-colors-neutral-b5);
    overflow: hidden;
`;
export const StyledTabs = styled(Tabs)`
    height: 32px !important;
    .sui-tabs-tab-list {
        height: 32px !important;
    }
`;
export const StyledSpan = styled(TextEclipse)<{
    disabled?: boolean;
    isTooltip?: boolean;
}>`
    color: var(--primary-text-color);
    font-size: 12px;
    line-height: 16px;
    ${({ isTooltip }) =>
        isTooltip
            ? css`
                  flex: 0 0 100%;
              `
            : css`
                  flex: 1;
              `}
    ${({ disabled }) =>
        disabled &&
        css`
            color: var(--sui-colors-neutral-b3);
        `}
`;

export const StyledActionsContainer = styled.div`
    display: flex;
    height: 52px;
    justify-content: center;
    align-items: center;
    align-content: center;
    gap: 10px;
    flex-shrink: 0;
    flex-wrap: wrap;
    & button {
        width: 120px;
    }
`;

export const StyledCheckbox = styled(Checkbox)`
    background-color: var(--sui-colors-neutral-base);
    &:has(input:focus-visible) {
        outline: 2px solid -webkit-focus-ring-color !important;
        outline-offset: 2px;
        border-radius: 4px;
    }
`;
