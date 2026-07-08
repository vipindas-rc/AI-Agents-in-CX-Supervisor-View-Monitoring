import styled, { css } from 'styled-components';

import SingleSelect from '../DropDown/SingleSelect';

export const StyledSectionTitle = styled.p`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 18px;
    font-weight: normal;
    letter-spacing: 0;
    line-height: ${({ theme }) => theme.font.lineHeight.heading3};
    margin-bottom: 15px;
    height: 40px;
    align-content: center;

    ${({ theme }) =>
        theme.isSWIframe &&
        css`
            text-transform: capitalize;
        `}
`;

export const TwoColumnsFormLayout = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-gap: 20px 40px;
    margin-bottom: 20px;
    align-items: start;
`;
export const StyledSection = styled.div<{
    full?: boolean;
    marginBottom?: number;
}>`
    width: ${({ full }) => (full ? '100%' : 'auto')};
    padding: ${({ full }) => (full ? '0 24px' : '0')};
    ${({ marginBottom }) =>
        marginBottom !== undefined &&
        css`
            margin-bottom: ${marginBottom}px;
        `}
`;
export const StyledSectionText = styled.p`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: ${({ theme }) => theme.font.size.base};
    font-weight: normal;
    letter-spacing: 0.25px;
    line-height: 20px;
    margin-bottom: 32px;
`;
export const StyledSubSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    margin-top: 16px;
`;
export const StyledSubSectionTitle = styled.p`
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 18px;
    font-weight: normal;
    line-height: 22px;
    letter-spacing: 0px;
    margin: 0;
`;
export const StyledWrapCheckbox = styled.div`
    display: inline-flex;
    height: 54px;
    & > div {
        height: 32px;
        align-self: flex-end;
    }
`;
export const StyledForm = styled.form`
    padding: 0 24px;
`;
export const OneColumnFormLayout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-gap: 20px;
`;

//TODO: remove this
export const NameFieldWrapper = styled.div`
    max-width: 480px;
`;

//TODO: remove this
export const StyledSingleSelect = styled(SingleSelect)<{
    hiddenOption?: boolean;
}>`
    // local solution to avoid redundant empty group in options list (local requirements)
    li:nth-child(1) {
        display: ${({ hiddenOption }) => (hiddenOption ? 'none' : 'flex')};
    }
`;
