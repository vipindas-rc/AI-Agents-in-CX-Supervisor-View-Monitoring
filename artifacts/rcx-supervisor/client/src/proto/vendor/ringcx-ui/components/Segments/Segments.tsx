import type { FC } from 'react';

import { SegmentsWrapper, StyledItem, SegmentBadge } from './Segments.styled';
import type { ISegmentsProps } from './types';
import TextEclipse from '../TextEclipse/TextEclipse';

const Segments: FC<ISegmentsProps> = ({
    items,
    size = 'large',
    index,
    onChange,
    ...props
}) => (
    <SegmentsWrapper
        {...{
            size,
            ...props,
        }}
    >
        {items &&
            items.map((item, itemIndex) => (
                <StyledItem
                    key={`item_${itemIndex}`}
                    size={size}
                    disabled={item.disabled}
                    className={`${itemIndex === index ? 'selected' : ''}`}
                    onClick={() => onChange(itemIndex)}
                    classes={{ label: 'segment-label' }}
                    data-aid={item.id && `segment_${item.id}`}
                >
                    <TextEclipse tooltipMsg={item.title}>
                        {item.title}
                    </TextEclipse>
                    {!!item.badgeContent && (
                        <SegmentBadge
                            data-aid='segment-badge'
                            badgeContent={item.badgeContent}
                        >
                            {item.badgeContent}
                        </SegmentBadge>
                    )}
                </StyledItem>
            ))}
    </SegmentsWrapper>
);

export default Segments;
