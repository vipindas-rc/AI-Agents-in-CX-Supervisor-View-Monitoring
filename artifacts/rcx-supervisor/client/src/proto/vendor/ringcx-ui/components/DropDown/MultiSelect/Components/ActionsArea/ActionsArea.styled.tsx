import type { PropsWithChildren } from 'react';

import styled from 'styled-components';

import type { IStyledButtonProps } from '../../../../Button';
import Button from '../../../../Button/Button';
import { ACTIONS_WRAPPER_HEIGHT } from '../../../constants';

export const ActionsWrapper = styled.div`
    min-width: 100%;
    box-sizing: border-box;
    height: ${ACTIONS_WRAPPER_HEIGHT}px;
    border: none;
    background-color: ${(p) => p.theme.colors.gray[0]};
    border-top: 1px solid ${(p) => p.theme.colors.gray[100]};
    border-radius: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
`;

export const ActionButton = styled(
    (props: PropsWithChildren<IStyledButtonProps>) => <Button {...props} />
)`
    && {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.15px;
        padding: 8px;
        &:disabled {
            cursor: default;
        }
    }
`;
