import type { FC, SyntheticEvent } from 'react';
import { memo, useCallback } from 'react';

import { StyledChip, StyledTitle } from './Chip.styled';
import CloseWrapper from './CloseWrapper';
import { TextEclipse } from '../TextEclipse';
import type { IChipProps } from './types/ChipProps';

const Chip: FC<IChipProps> = ({
    title,
    onClose,
    color = 'primary',
    variant = 'contained',
    disabled = false,
    size = 'medium',
    dataAid,
    onClick,
    ...restProps
}) => {
    const clickHandler = useCallback(
        (e: SyntheticEvent) => {
            e.stopPropagation();
            onClick();
        },
        [onClick]
    );

    return (
        <StyledChip
            {...{
                onClick: clickHandler,
                color,
                variant,
                disabled,
                size,
                ...restProps,
            }}
            data-aid={dataAid}
        >
            <TextEclipse tooltipMsg={title}>
                <StyledTitle size={size}>{title}</StyledTitle>
            </TextEclipse>
            <CloseWrapper
                {...{
                    onClose,
                    disabled,
                    size,
                }}
            />
        </StyledChip>
    );
};

export default memo(Chip);
