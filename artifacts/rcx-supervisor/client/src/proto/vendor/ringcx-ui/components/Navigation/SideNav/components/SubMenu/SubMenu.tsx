import { useEffect, useState, useMemo } from 'react';

import type { PopperProps } from '@material-ui/core/Popper';
import { useTranslation } from 'react-i18next';
import { useScrollbarWidth, useMeasure } from 'react-use';
import { useTheme } from 'styled-components';

import { INITIAL_OFFSET } from './constants';
import { Header, ScrollContainer, StyledSubMenu } from './SubMenu.styled';
import { getItems } from './SubMenuItem';
import type { ISubMenu } from './types/SubMenu';
import { TEST_AID } from '../../../../../constants';
import { i18next } from '../../../../../services/translate';
import { TextEclipse } from '../../../../TextEclipse';

export const SubMenu = ({
    expanded,
    showSubMenu,
    visibleNavGroup,
    currentRoute,
    isMoreMenu = false,
    layout,
    showSubMenuHeader,
    isSalesforceCRMAdminClient = false,
}: ISubMenu) => {
    const documentScrollBarWidth = useScrollbarWidth();

    const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);
    const [ref, { width }] = useMeasure<HTMLDivElement>();

    const theme = useTheme();

    useEffect(() => {
        setScrollbarWidth(() =>
            width === parseInt(theme.dimensions.subMenu, 10)
                ? 0
                : Number(documentScrollBarWidth)
        );
    }, [documentScrollBarWidth, theme.dimensions.subMenu, width]);

    const header =
        (visibleNavGroup &&
            (visibleNavGroup.header || visibleNavGroup.label)) ||
        '';

    const popperProps: Partial<PopperProps> = useMemo(
        () => ({
            modifiers: {
                offset: {
                    offset: `0, ${INITIAL_OFFSET + (scrollbarWidth || 0)}px`,
                },
            },
        }),
        [scrollbarWidth]
    );

    const { t } = useTranslation(undefined, { i18n: i18next });

    return (
        <StyledSubMenu
            {...{
                expanded,
                showSubMenu,
                layout,
                showSubMenuHeader,
                isSalesforceCRMAdminClient,
            }}
            role='menu'
            aria-label={
                visibleNavGroup?.label
                    ? `${visibleNavGroup.label} ${t('ARIA_LABELS.SUBMENU').toLowerCase()}`
                    : t('ARIA_LABELS.SUBMENU')
            }
            aria-hidden={!showSubMenu}
        >
            {showSubMenuHeader && (
                <Header
                    layout={layout}
                    data-aid={TEST_AID.SIDE_NAV_SUB_MENU_HEADER}
                >
                    <TextEclipse
                        tooltipMsg={header}
                        popperProps={popperProps}
                        placement={'right'}
                    >
                        {header}
                    </TextEclipse>
                </Header>
            )}
            <ScrollContainer ref={ref} layout={layout}>
                {visibleNavGroup &&
                    visibleNavGroup.children &&
                    getItems(
                        visibleNavGroup.children,
                        currentRoute,
                        isMoreMenu,
                        popperProps,
                        layout
                    )}
            </ScrollContainer>
        </StyledSubMenu>
    );
};
