import type { FC } from 'react';
import { Fragment, useCallback } from 'react';

import { Button, SortType, TextEclipse } from '@ringcx/ui';

import { InteractionRollupRows } from './InteractionRollupRows';
import type {
    IRollupInteraction,
    IRollupInteractionCol,
    IRollupInteractions,
} from './rollup';
import {
    StyledButtonWrapper,
    StyledInteractionRollupList,
    StyledNameWrapper,
    StyledTotalCount,
    StyledTotalText,
    StyledTotalWrapper,
} from './rollup.styled';
import CreateAngularModule from '../../../helpers/CreateAngularModule';
import translate from '../../../helpers/translate';

export const InteractionRollupModal: FC<IRollupInteractions> = ({
    rollupData,
    rollupColumns,
    onClose,
    total,
    agentName,
}) => {
    const renderRow = useCallback(
        (rowData: IRollupInteraction) => (
            <InteractionRollupRows data={rowData} key={rowData.sourceType} />
        ),
        []
    );

    const data: IRollupInteraction[] = rollupData
        .map((row) => {
            // add glId for react unique identifier
            const rollupRow = { ...row, glId: row?.sourceType };

            rollupColumns.map((column: IRollupInteractionCol) => {
                // convert to row data to number for the properties which are to be sorted as numbers
                if (column.sortAs === SortType.NUMBER) {
                    // @ts-ignore
                    if (rollupRow[column.id]) {
                        // @ts-ignore
                        rollupRow[column.id] =
                            // @ts-ignore
                            !isNaN(rollupRow[column.id]) &&
                            // @ts-ignore
                            Number(rollupRow[column.id]);
                    }
                }
            });

            const sourceName = row.sourceName || row.sourceType;
            return { ...rollupRow, sourceName };
        })
        .filter((row) => row.count !== 0);

    const columns = rollupColumns.map((column) => {
        column.content = translate(column?.translationPath) || '';
        return column;
    });

    const totalText = translate('GENERICS.MODAL.SUPERVISOR_STAT.TOTAL');
    const closeText = translate('GENERICS.MODAL.SUPERVISOR_STAT.CLOSE');
    const listAriaLabel = translate(
        'GENERICS.MODAL.SUPERVISOR_STAT.INTERACTION_ROLLUP'
    );

    const closeDialog = useCallback(() => {
        onClose();
    }, [rollupData]);

    return (
        <Fragment>
            <StyledNameWrapper>
                <TextEclipse tooltipMsg={agentName}>{agentName}</TextEclipse>
            </StyledNameWrapper>
            <StyledInteractionRollupList<IRollupInteraction>
                {...{
                    columns,
                    data,
                    renderRow,
                    listAriaLabel,
                }}
            />
            <StyledTotalWrapper>
                <StyledTotalText>{totalText}</StyledTotalText>
                <StyledTotalCount>{total}</StyledTotalCount>
            </StyledTotalWrapper>
            <StyledButtonWrapper>
                <Button onClick={closeDialog}>{closeText}</Button>
            </StyledButtonWrapper>
        </Fragment>
    );
};

export default CreateAngularModule(
    'interactionRollupModal',
    InteractionRollupModal,
    ['rollupData', 'rollupColumns', 'onClose', 'total', 'agentName'],
    []
);
