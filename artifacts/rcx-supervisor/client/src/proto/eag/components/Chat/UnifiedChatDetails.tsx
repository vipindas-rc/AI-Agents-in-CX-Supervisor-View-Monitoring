import { Fragment } from 'react';

import { Tab, TabContext, TabPanel, Tabs } from '@ringcentral/spring-ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { getChatDetailsInformation } from './helpers';
import { WIDGETS_PANEL_COLUMN } from '../../constants/testIds';
import { Interaction, PageType } from '../../containers/ContactManagement';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import injector from '../../helpers/injector';
import { filterVisibleWidgets, type Widget } from '../../helpers/widgets';
import { type IUnifiedWidgetHeader } from '../PhoneDetails/types/PhoneDetails';
import { UnifiedWidgetHeader } from '../PhoneDetails/UnifiedWidgetHeader';

type UnifiedChatDetailsProps = {
    isScriptAvailable: boolean;
    onSwitchTab: (tab: number | string) => void;
    selectedChat: any;
} & Pick<IUnifiedWidgetHeader, 'expanded' | 'onTogglePanel' | 'onPanelToggled'>;

export const UnifiedChatDetails = ({
    isScriptAvailable,
    expanded,
    onTogglePanel,
    onPanelToggled,
    onSwitchTab,
    selectedChat,
}: UnifiedChatDetailsProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const { t } = useTranslation();
    const handleSwitchTab = (index: number, name: string) => {
        onSwitchTab(index);
        AnalyticsSvc.track('RCX_agent_rightPanelTab_change', {
            section: PageType.Message,
            tapTab: name,
        });
    };
    let widgets: Widget[] = [
        {
            name: 'details',
            title: t('PHONE.FLYOVER.TAB_DETAILS'),
            render: () => (
                <Interaction
                    enableCollapse={false}
                    uii={selectedChat?.uii}
                    source={selectedChat?.chatQueueName}
                    isVoiceChannel={false}
                    detailInfoData={getChatDetailsInformation(selectedChat)}
                    section={PageType.Message}
                />
            ),
        },
        {
            name: 'script',
            visible: isScriptAvailable,
            title: t('RIGHT_PANEL.TABS.SCRIPT'),
            // script widget is rendered by angular
            render: () => null,
        },
    ];

    widgets = filterVisibleWidgets(widgets);

    const widget = widgets[0];

    let content: React.ReactNode = (
        <Fragment>
            <UnifiedWidgetHeader
                widgetTitle={widget.title}
                expanded={expanded}
                showToggleButton={expanded}
                onTogglePanel={onTogglePanel}
                onPanelToggled={onPanelToggled}
            />
            <div className='flex-1 overflow-y-auto'>
                {widget.render && widget.render(widget.children)}
            </div>
        </Fragment>
    );

    if (widgets.length > 1 && isScriptAvailable) {
        content = (
            <TabContext defaultValue={1}>
                <UnifiedWidgetHeader
                    expanded={expanded}
                    showToggleButton={expanded}
                    onTogglePanel={onTogglePanel}
                    onPanelToggled={onPanelToggled}
                >
                    <div
                        className='flex h-full items-end'
                        id='chat-detail-tabs-container'
                    >
                        <Tabs>
                            {widgets.map((widget, index) => (
                                <Tab
                                    key={widget.name}
                                    value={index}
                                    label={widget.title}
                                    onClick={(...args) =>
                                        handleSwitchTab(index, widget.name)
                                    }
                                    classes={{
                                        labelContainer: 'h-10',
                                    }}
                                />
                            ))}
                        </Tabs>
                    </div>
                </UnifiedWidgetHeader>
                {widgets.map((widget, index) => (
                    <TabPanel
                        key={widget.name}
                        value={index}
                        classes={{ root: 'flex-1 overflow-y-auto' }}
                        keepMounted
                    >
                        {widget.render && widget.render(widget.children)}
                    </TabPanel>
                ))}
            </TabContext>
        );
    }

    return (
        <div
            className={clsx(
                'flex h-full flex-none flex-col border-0 border-l border-solid border-b-neutral-200',
                !expanded && 'hidden'
            )}
            data-aid={WIDGETS_PANEL_COLUMN}
        >
            {content}
        </div>
    );
};

export default CreateAngularModule(
    'unifiedChatDetails',
    UnifiedChatDetails,
    [
        'expanded',
        'onTogglePanel',
        'onPanelToggled',
        'isScriptAvailable',
        'onSwitchTab',
        'selectedChat',
    ],
    [],
    true
);
