import type { FC, ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import Tab from './Tab';
import { TabsWrapper, TabsLabelsWrapper, StyledTabs } from './Tabs.styled';
import type ITabItem from './types/TabItem';
import type { ITabsProps } from './types/Tabs';
import { TEST_AID } from '../../constants/index';

const Tabs: FC<ITabsProps> = ({
    initialIndex = 0,
    size = 'headline',
    variant = 'standard',
    tabs,
    onChange,
    value,
    keepAlive = false,
    className,
    ...otherProps
}) => {
    const [selectedTab, setSelectedTab] = useState(initialIndex);

    const handleChange = (
        event: ChangeEvent<Record<string, unknown>>,
        newValue: number
    ) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
        if (tabs?.length && Number.isInteger(value) && tabs[Number(value)]) {
            setSelectedTab(Number(value));
        }
    }, [tabs, value]);

    return (
        <TabsWrapper className={className}>
            <TabsLabelsWrapper size={size}>
                {tabs && (
                    <StyledTabs
                        value={selectedTab}
                        onChange={onChange || handleChange}
                        indicatorColor='primary'
                        variant={variant}
                        {...otherProps}
                    >
                        {tabs.map((item: ITabItem, index: number) => (
                            <Tab
                                size={size}
                                disabled={item.disabled}
                                key={`tab_${index}`}
                                label={item.label}
                                value={item.value}
                            />
                        ))}
                    </StyledTabs>
                )}
            </TabsLabelsWrapper>

            {keepAlive
                ? tabs.map((item: ITabItem, index: number) => (
                      <div
                          key={`tab_content_${index}`}
                          style={{
                              display: selectedTab === index ? 'block' : 'none',
                          }}
                          data-aid={TEST_AID.TAB_CONTAINER}
                      >
                          {item.content}
                      </div>
                  ))
                : tabs[selectedTab].content}
        </TabsWrapper>
    );
};

export default Tabs;
