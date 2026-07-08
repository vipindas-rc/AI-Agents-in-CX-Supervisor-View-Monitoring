import styled from 'styled-components';

interface IDraggableConfigOptionStyled {
    isDragging?: boolean;
}

type IOptionDragHandleStyled = IDraggableConfigOptionStyled;

export const DraggableConfigOptionStyled = styled.div<IDraggableConfigOptionStyled>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: ${({ isDragging }) => (isDragging ? 0 : 1)};
    cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
    background: var(--table-config-grid-background);
    border-radius: 4px;
    min-height: 28px;
    padding: 4px 6px;
    will-change: transform;
    transition: transform 0.2s;

    [class*='MuiFormControlLabel-label'] {
        max-width: 157px;
    }

    &:focus-within {
        outline: 2px solid var(--content-brand) !important;
        outline-offset: 2px;
        border-radius: 4px;
    }
`;

export const OptionDragHandleStyled = styled.div<IOptionDragHandleStyled>`
    margin: 8px;
    width: 12px;
    height: 12px;
    font-size: 0.8rem;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
`;
