import styled from 'styled-components';

const TOP_NAV_HEIGHT = 64;
const SEARCH_MAX_WIDTH = 460;

export const Wrapper = styled.div`
    width: 100%;
    flex-shrink: 0;
    border-bottom: 2px solid ${({ theme: { colors } }) => colors.gray[100]};
`;

export const FilterWrapper = styled.div`
    max-width: 320px;
    display: flex;
    flex-direction: row;
    align-self: flex-end;
`;

export const TopPanel = styled.div`
    font-size: 16px;
    font-weight: normal;
    line-height: 24px;
    display: grid;
    grid-template-columns: 1fr 900px 1fr;
    align-items: center;
    width: 100%;
    margin: auto;
    height: ${TOP_NAV_HEIGHT}px;
    padding: 0 24px;
    position: relative;
`;

export const Title = styled.h1`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 16px;
    font-weight: normal;
    line-height: 24px;
    margin-right: 24px;
`;

export const StyledHeaderSearch = styled.div`
    max-width: ${SEARCH_MAX_WIDTH}px;
    flex-basis: 100%;
    flex-grow: 1;
`;
