import type { MouseEvent, KeyboardEvent } from 'react';
import { useCallback } from 'react';

import { StyledChipClose } from './ChipClose.styled';
import { StyledCloseWrapper } from './CloseWrapper.styled';
import type { ICloseWrapper } from './types/CloseWrapper';
import { TEST_AID } from '../../constants';

const CloseWrapper = ({ onClose, disabled, size }: ICloseWrapper) => {
    const handleClick = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            onClose();
        },
        [onClose]
    );
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLSpanElement>) => {
            if (e.key === 'Backspace' || e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                onClose();
            }
        },
        [onClose]
    );
    const preventParentRipple = useCallback((e: MouseEvent) => {
        e.stopPropagation();
    }, []);
    return (
        <StyledCloseWrapper
            onKeyDown={handleKeyDown}
            onMouseDown={preventParentRipple}
            onClick={handleClick}
            tabIndex={0}
            role='button'
            data-aid={TEST_AID.CHIP.CLOSE_BUTTON}
        >
            <StyledChipClose disabled={disabled} size={size} />
        </StyledCloseWrapper>
    );
};

export default CloseWrapper;
