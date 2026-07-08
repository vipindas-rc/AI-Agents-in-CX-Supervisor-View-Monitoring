import type { FC } from 'react';
import { useMemo } from 'react';

import { StyledTab } from './Tabs.styled';
import { TextEclipse } from '../TextEclipse';
import type { ITabProps } from './types/Tab';

const Tab: FC<ITabProps> = ({ label, size = 'headline', ...props }) => {
    const wrappedLabel = useMemo(
        () => (
            <TextEclipse
                {...{
                    tooltipMsg: label,
                    popperProps: {
                        modifiers: {
                            offset: {
                                offset: `0, ${
                                    size === 'headline' ? '17px' : '6px'
                                }`,
                            },
                        },
                    },
                }}
            >
                {label}
            </TextEclipse>
        ),
        [label, size]
    );

    return <StyledTab label={wrappedLabel} {...props} />;
};

export default Tab;
