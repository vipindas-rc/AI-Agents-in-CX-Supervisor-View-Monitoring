import type { FC } from 'react';
import { memo } from 'react';

import { StyledChip } from './MultiToogleItem.styled';
import type { IMultiToggleItem } from './types';
import { TagComponent as Tag } from '../../../../../../Tag';
import { isTagVariantGuard } from '../../../../../types';

const MultiToggleItem: FC<IMultiToggleItem> = ({
    item,
    size,
    disabled,
    selected,
    dataAid,
    onClick,
    onClose,
}) => {
    if (isTagVariantGuard(item.variant)) {
        return (
            <Tag
                color={item.variant.color}
                text={item.displayName}
                disabled={disabled}
                eclipsable={false}
                onClick={onClick}
                onClose={onClose}
            />
        );
    }

    return (
        <StyledChip
            title={item.displayName}
            onClose={onClose}
            onClick={onClick}
            disabled={disabled}
            selected={selected}
            size={size}
            dataAid={dataAid}
            className='eui-multi-toggle-chip'
        />
    );
};

export default memo(MultiToggleItem);
