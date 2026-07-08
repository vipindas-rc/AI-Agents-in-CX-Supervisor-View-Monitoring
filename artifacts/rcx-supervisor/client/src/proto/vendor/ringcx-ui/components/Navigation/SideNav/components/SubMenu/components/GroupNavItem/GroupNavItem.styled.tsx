import styled from 'styled-components';

export const SubGroup = styled.span`
    display: block;
    margin-bottom: 28px;

    &:last-of-type {
        margin-bottom: 10px;
    }
`;

export const SubGroupTitle = styled.h4`
    overflow: hidden;
    user-select: none;
    white-space: nowrap;
    line-height: 34px;
    height: 34px;
    margin: 10px 24px;
    padding: 0;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.15px;
    text-transform: uppercase;

    color: ${({ theme }) => theme.colors.gray[800]};
`;
