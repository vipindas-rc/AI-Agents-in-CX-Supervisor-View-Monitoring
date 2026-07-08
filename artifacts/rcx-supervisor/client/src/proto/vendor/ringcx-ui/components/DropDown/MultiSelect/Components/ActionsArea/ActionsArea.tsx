import type { FC } from 'react';

import { ActionButton, ActionsWrapper } from './ActionsArea.styled';
import type IActionsArea from './types/ActionsArea';

const ActionsArea: FC<IActionsArea> = ({
    allSelected,
    nothingSelected,
    selectAllText,
    deselectAllText,
    onSelectAll,
    onDeselectAll,
}) => (
    <ActionsWrapper>
        {/*
        @ts-ignore */}
        <ActionButton
            size='small'
            variant='text'
            color='primary'
            disabled={allSelected}
            onClick={onSelectAll}
        >
            {selectAllText}
        </ActionButton>
        {/*
        @ts-ignore */}
        <ActionButton
            size='small'
            variant='text'
            color='primary'
            disabled={nothingSelected}
            onClick={onDeselectAll}
        >
            {deselectAllText}
        </ActionButton>
    </ActionsWrapper>
);

export default ActionsArea;
