import type { FC, SyntheticEvent, KeyboardEvent } from 'react';
import { useCallback } from 'react';

import {
    StyledRowDataContainer,
    StyledTickContainer,
    StyledRow,
} from './Row.styled';
import type { IRow } from './types/Row';
import { StyledTickIcon } from '../../../../AccountPicker/components/CheckedTableCell/CheckedTableCell.styled';
import { CHECKBOX_COLUMN } from '../../../../AccountPicker/constants';
import type { GridListAccount } from '../../../../AccountPicker/types';

const Row: FC<IRow> = ({
    data,
    columns,
    isSuperUser,
    isChecked,
    onSelectAccount,
}) => {
    const getRow = useCallback(() => {
        return columns.map(({ id }) => {
            return id === CHECKBOX_COLUMN ? (
                <StyledTickContainer key={id} role='gridcell'>
                    {isChecked && <StyledTickIcon disabled={false} />}
                </StyledTickContainer>
            ) : (
                <StyledRowDataContainer key={id} role='gridcell' tabIndex={0}>
                    {data[id as keyof GridListAccount]}
                </StyledRowDataContainer>
            );
        });
    }, [columns, data, isChecked]);

    const handleRowClick = useCallback(
        (evt: SyntheticEvent) => {
            evt.stopPropagation();
            onSelectAccount(data);
        },
        [onSelectAccount, data]
    );
    const handleRowKeydown = useCallback(
        (e: KeyboardEvent<HTMLSpanElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                onSelectAccount(data);
            }
        },
        [onSelectAccount, data]
    );
    return (
        <StyledRow
            onClick={handleRowClick}
            onKeyDown={handleRowKeydown}
            isSuperUser={isSuperUser}
            isChecked={isChecked}
            role='presentation'
        >
            {getRow()}
        </StyledRow>
    );
};

export default Row;
