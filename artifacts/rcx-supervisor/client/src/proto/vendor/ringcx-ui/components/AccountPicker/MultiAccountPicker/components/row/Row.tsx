import type { FC, SyntheticEvent } from 'react';
import { useCallback } from 'react';

import { StyledRowContainer } from './Row.styled';
import type { IRow } from './types/Row';
import Checkbox from '../../../../../components/Checkbox';
import { TEST_AID } from '../../../../../constants';
import { StyledTickIcon } from '../../../components/CheckedTableCell/CheckedTableCell.styled';

const Row: FC<IRow> = ({ data, onSelect, selectRowForAccountAriaLabel }) => {
    const stopPropagation = useCallback(
        (e: SyntheticEvent) => e.stopPropagation(),
        []
    );
    return (
        <StyledRowContainer
            onClick={() => onSelect(data)}
            disabled={data.disabled}
            role='presentation'
        >
            <div role='gridcell'>
                {data.disabled ? (
                    <StyledTickIcon disabled={data.disabled} />
                ) : (
                    <label
                        htmlFor={`rowCheckbox_${data.accountId}`}
                        data-aid={TEST_AID.MULTI_ACCOUNT_ROW_CHECKBOX_LABEL}
                        onClick={stopPropagation}
                    >
                        <Checkbox
                            id={`rowCheckbox_${data.accountId}`}
                            data-aid={TEST_AID.MULTI_ACCOUNT_ROW_CHECKBOX}
                            checked={!!data.selected}
                            onClick={stopPropagation}
                            onChange={() => onSelect(data)}
                            inputProps={{
                                'aria-label': selectRowForAccountAriaLabel?.(
                                    data.accountName
                                ),
                            }}
                        />
                    </label>
                )}
            </div>
            <div role='gridcell'>{data.accountId}</div>
            <div role='gridcell'>{data.accountName}</div>
        </StyledRowContainer>
    );
};
export default Row;
