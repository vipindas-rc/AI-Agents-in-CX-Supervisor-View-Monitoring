import type { PropsWithChildren, FC } from 'react';
import { Fragment } from 'react';

import { Grid } from '@material-ui/core';

import { CRMMatchResultLabel } from '../CRMMatchResult/CRMMatchResult.styled';

export type CRMFormFieldProps = PropsWithChildren<{
    label: string;
    labelAid?: string;
    action?: React.ReactNode;
}>;

export const CRMFormField: FC<CRMFormFieldProps> = ({
    label,
    labelAid,
    action,
    children,
}) => {
    return (
        <Fragment>
            <CRMMatchResultLabel data-aid={labelAid}>
                {action ? (
                    <Grid
                        container
                        justifyContent='space-between'
                        alignItems='center'
                    >
                        <div>{label}</div>
                        <div>{action}</div>
                    </Grid>
                ) : (
                    label
                )}
            </CRMMatchResultLabel>
            {children}
        </Fragment>
    );
};
