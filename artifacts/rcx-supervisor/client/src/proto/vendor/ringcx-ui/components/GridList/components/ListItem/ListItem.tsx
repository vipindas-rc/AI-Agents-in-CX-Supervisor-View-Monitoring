import { isValidElement, useRef, useState } from 'react';

import { isActivationKey } from '../../../../helpers/keyboard';
import { GL_KEYS, GD_CLASS_PREFIX } from '../../constants';
import type { RenderRowOneRowData } from '../../types';

type BasicListItemProps<R> = {
    item: RenderRowOneRowData<R>;
    renderRow: (props: RenderRowOneRowData<R>) => React.ReactNode;
    'data-aid'?: string;
    classes?: string;
    ariaRoleForRows?: string;
    parentGlId?: string;
};

export default function BasicListItem<R>({
    item,
    renderRow,
    classes,
    ariaRoleForRows,
    'data-aid': dataAid,
    parentGlId,
}: BasicListItemProps<R>) {
    const [isFocused, setFocused] = useState(false);
    const rowRef = useRef<HTMLDivElement | null>(null);

    const { glId, ...dataRow } = item;
    const itemWithFocus = parentGlId
        ? { ...item, isFocused, parentGlId }
        : { ...item, isFocused };
    const component: React.ReactNode = renderRow(itemWithFocus);
    const componentProps = isValidElement(component) ? component.props : {};

    const onClick = componentProps.onClick;

    function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (isActivationKey(e.key) && onClick && e.target === e.currentTarget) {
            e.preventDefault();
            onClick(dataRow);
        }
    }

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
            data-aid={dataAid}
            data-row-id={glId}
            tabIndex={0}
            role={ariaRoleForRows}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            {component}
        </div>
    );
}
