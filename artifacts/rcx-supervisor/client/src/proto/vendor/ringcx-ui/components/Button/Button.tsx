import { Fragment } from 'react';
import type { FC, PropsWithChildren, ReactElement } from 'react';

import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

import {
    ButtonTheme,
    ButtonWrapper,
    HiddenLabel,
    StyledSpinnerWrap,
} from './Button.styled';
import type { IStyledButtonProps } from './types';
import type { ISpinnerProps } from '../Spinner';
import Spinner from '../Spinner';

const StyledSpinner = (props: ISpinnerProps): ReactElement => (
    <StyledSpinnerWrap>
        <Spinner {...props} />
    </StyledSpinnerWrap>
);

const Button: FC<PropsWithChildren<IStyledButtonProps>> = ({
    children,
    action,
    disabled = false,
    variant = 'contained',
    color = 'primary',
    size = 'medium',
    disableElevation = true,
    loading = false,
    ...props
}) => (
    <ButtonWrapper
        {...{
            'aria-busy': loading || undefined,
            action,
            variant,
            size,
            color,
            disabled,
            disableElevation,
            ...props,
        }}
    >
        {loading ? (
            <Fragment>
                <StyledSpinner size='small' />
                <HiddenLabel>{children}</HiddenLabel>
            </Fragment>
        ) : (
            children
        )}
    </ButtonWrapper>
);
const WithStyledButton = withStyles(ButtonTheme)(Button);

export default styled(WithStyledButton)``;
