import type { FC, PropsWithChildren } from 'react';

import { SkeletonAnimation, SkeletonBase } from './Skeleton.styled';
import type { ISkeleton } from './types';

const Skeleton: FC<PropsWithChildren<ISkeleton>> = ({
    children,
    variant = 'rect',
    width,
    height = 20,
    border = true,
    fill = 'light',
    animation = true,
    ...props
}) => {
    const content = animation ? (
        <SkeletonAnimation fill={fill}>{children}</SkeletonAnimation>
    ) : (
        children
    );
    return (
        <SkeletonBase
            {...{
                variant,
                width,
                height,
                border,
                fill,
                animation,
                ...props,
            }}
        >
            {content}
        </SkeletonBase>
    );
};

export default Skeleton;
