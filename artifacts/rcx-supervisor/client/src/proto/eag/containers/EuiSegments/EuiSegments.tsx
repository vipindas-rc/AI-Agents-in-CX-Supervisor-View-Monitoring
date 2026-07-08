import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { Segments } from '@ringcx/ui';

import type { ISegmentItem, IEuiSegments } from './types/EuiSegments';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const EuiSegments: FC<IEuiSegments> = ({
    segmentLabels,
    selectedIndex,
    setSelectedType,
    segmentsBadgeCount,
    ...restProps
}) => {
    const [items, setItems] = useState<ISegmentItem[]>([]);
    const [index, setIndex] = useState(0);

    // update items when segmentLabels is updated
    useEffect(() => {
        if (segmentLabels && segmentLabels.length) {
            const newItems = segmentLabels.map((type) => {
                return {
                    title: translate(`${type}`),
                    badgeContent: segmentsBadgeCount?.[type],
                };
            });

            setItems(newItems);
        }
    }, [segmentLabels, segmentsBadgeCount]);

    useEffect(() => {
        if (selectedIndex !== undefined && selectedIndex !== null) {
            setIndex(selectedIndex);
        }
    }, [selectedIndex]);

    const onChange = (i: number) => {
        setIndex(i);
        const selected = items[i];
        const label = segmentLabels.find((type) =>
            selected.title.includes(translate(`${type}`))
        );
        label && setSelectedType(label);
    };

    // render segments component when items are set
    if (items && items.length && selectedIndex >= 0) {
        return <Segments {...{ index, onChange, items, ...restProps }} />;
    }

    return <div />;
};

export default CreateAngularModule(
    'euiSegments',
    EuiSegments,
    ['segmentLabels', 'size', 'selectedIndex', 'setSelectedType'],
    []
);
