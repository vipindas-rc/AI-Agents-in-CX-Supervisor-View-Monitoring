import { Dialog, TextField } from '@ringcentral/spring-ui';
import styled from 'styled-components';

export const StyledDialog = styled(Dialog)`
    && {
        & > div[role='dialog'] {
            height: 100vh;
            max-height: 100vh;
            width: 100vw;
            max-width: 100vw;
            margin: 0;
            border-radius: 0;
            padding: 0;
        }
    }
`;

export const RequeueContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;

export const HeaderContainer = styled.div`
    height: 36px;
    line-height: 36px;
    padding: 0 var(--sui-spacing-2);
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.15);

    &&& > button {
        color: var(--sui-colors-neutral-b1);
    }
`;

export const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
`;

export const ListContainer = styled.div`
    flex: 1;
    overflow-y: auto;
`;

export const StyledTextField = styled(TextField)`
    &&&.sui-form-field-outlined:focus .sui-form-field-focus-effect,
    &&&.sui-form-field-outlined:focus-within .sui-form-field-focus-effect,
    &&&.sui-form-field-outlined.sui-focused .sui-form-field-focus-effect {
        border-radius: 4px;
    }
`;

export const SearchContainer = styled.div`
    padding: var(--sui-spacing-4);
`;
