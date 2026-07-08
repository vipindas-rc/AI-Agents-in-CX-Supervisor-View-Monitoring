import styled from 'styled-components';

export const StatsMenuStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .engage-icons {
        transition: color 0.5s;
        padding-left: 10px;
        color: var(--menu-background);
        font-weight: bold;
        font-size: 14px;

        &.show-icon {
            color: var(--primary-text-color);
        }
    }

    *:focus-visible > & .engage-icons {
        color: var(--primary-text-color);
    }
`;

export const StyledStatsLabel = styled.span`
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
    white-space: normal;
`;
