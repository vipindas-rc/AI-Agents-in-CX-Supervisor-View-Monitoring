import { GearOutlined, SingleSelect } from '@ringcx/ui';
import styled from 'styled-components';

export const StatsCrmContainer = styled.div`
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for Firefox */
    scrollbar-width: none;

    /* Hide scrollbar for IE and Edge */
    -ms-overflow-style: none;
`;

export const StatsCrmHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
    > div {
        flex: 1;
    }
`;

export const TypeSingleSelect = styled(SingleSelect)`
    height: 34px;
    & li[role='menuitem'] {
        min-height: unset;
    }
`;

export const SettingIcon = styled(GearOutlined)`
    font-size: 16px;
    color: var(--sui-colors-neutral-b0-t50);
    &:hover {
        cursor: pointer;
    }
`;
