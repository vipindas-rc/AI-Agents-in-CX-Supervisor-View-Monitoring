import { useRef, useState } from 'react';

import { isActivationKey } from '../../../../helpers/keyboard';
import { GL_KEYS, GD_CLASS_PREFIX } from '../../constants';
import type { RenderRowGroupData } from '../../types';
import ExpandIcon from '../BasicListGroup/components/ExpandIcon';

type GroupedListItemProps<R, S = unknown> = {
    item: RenderRowGroupData<R, S>;
    renderRow: (props: RenderRowGroupData<R, S>) => React.ReactNode;
    'data-aid'?: string;
    classes?: string;
    ariaRoleForRows?: string;
    isOpen?: boolean;
    onChangeOpenState: (glId: string) => void;
};

export default function GroupedListItem<R, S = unknown>({
    item,
    classes,
    isOpen,
    onChangeOpenState,
    renderRow,
    ariaRoleForRows,
    'data-aid': dataAid,
}: GroupedListItemProps<R, S>) {
    const [isFocused, setFocused] = useState(false);
    const rowRef = useRef<HTMLDivElement | null>(null);

    const { glId } = item;

    const itemWithFocus = { ...item, isFocused };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isActivationKey(e.key) && e.target === e.currentTarget) {
            e.preventDefault();
            onChangeOpenState(glId);
        }
    };

    function onFocus() {
        setFocused(true);
    }

    function onBlur() {
        setTimeout(() => {
            if (
                rowRef.current &&
                !rowRef.current.contains(document.activeElement)
            ) {
                setFocused(false);
            }
        }, 0);
    }
    const className = `${classes} ${GD_CLASS_PREFIX}${glId}`;
    return (
        <div
            key={glId + GL_KEYS.ROW}
            ref={rowRef}
            className={className}
            onClick={() => onChangeOpenState(glId)}
            onKeyDown={onKeyDown}
            data-aid={dataAid}
            tabIndex={0}
            role={ariaRoleForRows}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            <ExpandIcon isExpanded={!!isOpen} />
            {renderRow(itemWithFocus)}
        </div>
    );
}
