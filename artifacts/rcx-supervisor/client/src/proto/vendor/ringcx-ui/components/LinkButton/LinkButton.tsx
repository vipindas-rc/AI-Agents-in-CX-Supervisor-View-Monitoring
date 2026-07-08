import type { PropsWithChildren, KeyboardEvent, MouseEvent } from 'react';
import { forwardRef } from 'react';

import {
    StyledIconWrapper,
    StyledLabelWrapper,
    StyledLinkButton,
} from './LinkButton.styled';
import type { LinkButtonType } from './types/LinkButton';
import { isActivationKey } from '../../helpers/keyboard';
import { EMPTY_CALLBACK } from '../../helpers/usage';

const LinkButton = forwardRef<
    HTMLButtonElement,
    PropsWithChildren<LinkButtonType>
>(
    (
        {
            underline = 'none',
            title,
            children,
            icon = null,
            color = 'primary',
            iconPosition = 'left',
            disabled = false,
            onClick = EMPTY_CALLBACK,
            ...restProps
        },
        ref
    ) => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (disabled) return;
            if (isActivationKey(event.key)) {
                event.preventDefault();
                onClick(event);
            }
        };

        const handleClick = (event: MouseEvent) => {
            if (disabled) return;
            onClick(event);
        };

        return (
            <StyledLinkButton
                ref={ref}
                {...{
                    tabIndex: disabled ? -1 : 0,
                    'aria-disabled': disabled,
                    underline,
                    color,
                    disabled,
                    onClick: handleClick,
                    onKeyDown: handleKeyDown,
                    ...restProps,
                }}
            >
                {icon && iconPosition === 'left' && (
                    <StyledIconWrapper
                        iconPosition={iconPosition}
                        disabled={disabled}
                    >
                        {icon}
                    </StyledIconWrapper>
                )}
                <StyledLabelWrapper>{title || children}</StyledLabelWrapper>
                {icon && iconPosition === 'right' && (
                    <StyledIconWrapper
                        iconPosition={iconPosition}
                        disabled={disabled}
                    >
                        {icon}
                    </StyledIconWrapper>
                )}
            </StyledLinkButton>
        );
    }
);

export default LinkButton;
