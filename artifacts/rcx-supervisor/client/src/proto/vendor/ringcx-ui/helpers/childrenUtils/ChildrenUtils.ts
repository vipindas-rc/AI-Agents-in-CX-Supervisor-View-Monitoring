import type { ReactNode, ReactElement } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

interface IChildType {
    children?: ReactNode;
}

export const RecursiveApplyPropsToChildren = (
    children: ReactNode,
    callback: (child: ReactElement) => ReactElement
) =>
    Children.map(children, (child) => {
        if (!isValidElement<IChildType>(child)) {
            return child;
        }

        let elementChild: ReactElement<IChildType> = child;
        if (elementChild.props.children) {
            elementChild = cloneElement(elementChild, {
                children: RecursiveApplyPropsToChildren(
                    elementChild.props.children,
                    callback
                ),
            });
        }

        return callback(elementChild);
    });

export const extractTextFromReactNode = (node: ReactNode): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
        return node.map(extractTextFromReactNode).join(' ');
    }
    if (isValidElement(node) && node.props.children) {
        return extractTextFromReactNode(node.props.children);
    }
    return '';
};
