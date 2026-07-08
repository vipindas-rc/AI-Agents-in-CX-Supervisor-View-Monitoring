import { type RcButtonProps } from '@ringcentral/juno';
import { PhoneBorder } from '@ringcentral/juno-icon';

import { StyledRcButton } from './BigActionButton.styled';
import type { ActionButtonsProps } from './types/BigActionButton';
import { ButtonType } from './types/BigActionButton';
import { BIG_ACTION_BUTTON } from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { withBrandTheme } from '../../helpers/withBrandTheme';

export const BigActionButton = withBrandTheme(
    ({ buttonType, ...props }: ActionButtonsProps) => {
        // Default button props
        let buttonProps: Partial<RcButtonProps> = {
            variant: 'outlined',
            radius: 'round',
            size: 'large',
            ...props,
        };

        const isStartWorkingScreen = buttonType
            ? buttonType === ButtonType.START_WORKING
            : false;

        // modify button props based on buttonType
        if (isStartWorkingScreen) {
            buttonProps = {
                ...buttonProps,
                size: 'xlarge',
            };
        }

        return (
            <StyledRcButton
                {...(isStartWorkingScreen && { symbol: PhoneBorder })}
                data-aid={BIG_ACTION_BUTTON}
                buttonType={buttonType}
                {...buttonProps}
            >
                {props.children}
            </StyledRcButton>
        );
    }
);

export const NgBigActionButton = ({
    onClick,
    disabled,
    label,
    color,
    type,
}: ActionButtonsProps) => {
    return (
        <BigActionButton
            buttonType={ButtonType.FETCH_LEADS}
            {...{ onClick, disabled, type, color }}
        >
            {label}
        </BigActionButton>
    );
};

export default CreateAngularModule(
    'bigActionButton',
    NgBigActionButton,
    ['onClick', 'disabled', 'label', 'type', 'color'],
    []
);
