import { MultipleLineTextEclipse } from '@ringcx/ui';
import styled from 'styled-components';

export const StatsCrmCardsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 8px;
`;
export const StatsCrmCardContainer = styled.div`
    display: flex;
    gap: 8px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    flex-wrap: wrap;
`;

export const StatsCrmCard = styled.div`
    display: flex;
    padding: 10px 4px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 68px;
    max-width: 65px;
    flex: 1 1 25%;
    border-radius: 4px;
    border-top: 0.5px solid var(--sui-colors-neutral-b4);
    border-right: 0.5px solid var(--sui-colors-neutral-b4);
    border-bottom: 1px solid var(--sui-colors-neutral-b4);
    border-left: 0.5px solid var(--sui-colors-neutral-b4);
    background: var(--sui-colors-neutral-b5);
    box-shadow:
        0px 0px 0px 2px #eaecef,
        0px 2px 4px 0px rgba(255, 255, 255, 0.25) inset;
`;

export const StatsCrmCardTitle = styled(MultipleLineTextEclipse)`
    color: var(--sui-colors-neutral-b2);
    font-size: 10px;
    text-align: center;
`;

export const StatsCrmCardContent = styled.span`
    color: var(--sui-colors-neutral-b1);
    font-size: 11px;
    line-height: 17px;
`;

export const StatsCrmCardGroupLabel = styled.div`
    color: var(--sui-colors-neutral-b0);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
`;
