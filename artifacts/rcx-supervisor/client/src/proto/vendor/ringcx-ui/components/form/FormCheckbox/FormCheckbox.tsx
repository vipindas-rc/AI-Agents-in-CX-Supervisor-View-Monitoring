import { Fragment, forwardRef } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import {
    Icon,
    Label,
    IconWrapper,
    FormCheckboxContainer,
} from './FormCheckbox.styled';
import type { FormCheckboxProps } from './types';
import { i18next } from '../../../services/translate';
import { themeV4toV5 } from '../../../theme/theme';
import Tooltip from '../../Tooltip';
import { Checkbox } from '../Checkbox';

/**
 *@deprecated
 * DO NOT USE THIS DIRECTLY, use renderCheckboxControl instead
 */
export const FormCheckbox = forwardRef<HTMLButtonElement, FormCheckboxProps>(
    ({ label, tooltipMessage, labelCompensation, margin, ...rest }, ref) => {
        const { t } = useTranslation(undefined, { i18n: i18next });

        return (
            <ThemeProvider theme={themeV4toV5}>
                <FormCheckboxContainer
                    labelCompensation={labelCompensation}
                    margin={margin}
                >
                    <Label
                        control={<Checkbox {...rest} ref={ref} />}
                        label={
                            <Fragment>
                                {label}
                                {tooltipMessage && (
                                    <Tooltip title={tooltipMessage}>
                                        <IconWrapper
                                            tabIndex={0}
                                            aria-label={`${t('ARIA_LABELS.MORE_INFO')}: ${tooltipMessage}`}
                                        >
                                            <Icon />
                                        </IconWrapper>
                                    </Tooltip>
                                )}
                            </Fragment>
                        }
                    />
                </FormCheckboxContainer>
            </ThemeProvider>
        );
    }
);
