import styled from 'styled-components';

export const StoryWrapper = styled.div`
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    column-gap: 20px;
`;

export const ColWrapper = styled.div`
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: 50px;
`;

export const ItemWrapper = styled.div`
    width: 300px;
    & + & {
        margin-top: 20px;
    }
`;

export const Row = styled.div`
    & + & {
        margin-top: 10px;
    }

    button + button {
        margin-left: 10px;
    }
`;
