import { type FC } from 'react';

import { FormControl } from '@mui/material';

import { defaultSize } from './constants';
import { StyledMergeLayoutContainer } from './GroupMergeLayout.styled';
import type { IGroupMergeLayout } from './types';
import { StyledTitle } from '../FormControl/FormControl.styled';

const GroupMergeLayout: FC<IGroupMergeLayout> = ({
    components,
    title,
    required,
    size = { ...defaultSize },
    muiVersion = 5,
    dataAid,
}) => {
    return (
        <FormControl>
            {title && (
                <StyledTitle required={!!required} htmlFor={dataAid}>
                    {title}
                </StyledTitle>
            )}
            <StyledMergeLayoutContainer size={size} muiVersion={muiVersion}>
                {components}
            </StyledMergeLayoutContainer>
        </FormControl>
    );
};

export default GroupMergeLayout;
