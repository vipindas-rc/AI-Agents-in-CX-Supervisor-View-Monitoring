import styled from 'styled-components';

export const PhoneHeaderWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    overflow-y: auto;
`;

export const StyledPhoneDetails = styled.div<{ withoutScript: boolean }>`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    height: ${(props) => (props.withoutScript ? '100%' : 'auto')};
`;
