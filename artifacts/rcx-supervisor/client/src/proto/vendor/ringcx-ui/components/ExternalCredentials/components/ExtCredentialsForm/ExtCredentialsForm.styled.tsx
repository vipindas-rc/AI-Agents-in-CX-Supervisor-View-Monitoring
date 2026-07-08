import styled from 'styled-components';

export const FieldsWrapper = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
    .icon-information {
        vertical-align: middle;
    }
`;

export const SpinnerWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.6);
    z-index: 1000;
`;
