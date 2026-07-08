import type { FC, SyntheticEvent } from 'react';
import {
    useCallback,
    useDeferredValue,
    useEffect,
    useRef,
    useState,
    useMemo,
} from 'react';

import { isWEMOpenInNewTab, Navigation, UserService } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import Tooltip from './../../components/Tooltip';
import { getPermissions } from './AppSwitcher.service';
import {
    StyledIconButton,
    StyledPopper,
    AppSwitcherWrapper,
} from './AppSwitcher.styled';
import { AppSwitcherBlank } from './components/AppSwitcherBlank/AppSwitcherBlank';
import { List } from './components/List';
import type { ListGroupType } from './components/ListGroup';
import type { ListItemType } from './components/ListItem';
import { AppSwitcherIcons, defaultLabels } from './constants';
import { getPermittedItems } from './helpers';
import type { AppSwitcherProps } from './types';
import { TEST_AID } from '../../constants';
import { AppSwitcherMenu } from '../../icons';
import { i18next } from '../../services/translate';

// We will show placeholder only if pass loading attribute as true
// Its help correct work in case when app support pre-loaders and when its work without them
const AppSwitcher: FC<AppSwitcherProps> = ({
    loading,
    rcAccountId,
    labels = defaultLabels,
    onTrackAnalytics,
    portalType,
    onWEMNotConfigured,
    accessibilityLabels,
}) => {
    const [isPermissionChecking, setPermissionChecking] = useState(loading);
    const [isOpenMenu, setOpenMenu] = useState(false);
    const [appGroups, setAppGroups] = useState<ListGroupType[] | null>(null);
    const wemLoader = useRef<boolean>(false);
    const toggleMenu = useCallback(async () => {
        setOpenMenu((oldIsOpenMenu) => !oldIsOpenMenu);
        onTrackAnalytics && onTrackAnalytics('RCX_app_picker_clicked');
    }, [onTrackAnalytics]);

    const { t } = useTranslation(undefined, { i18n: i18next });

    const isLoading = useDeferredValue(loading || isPermissionChecking);
    const areGroupsLoaded = !!appGroups;

    const handleWEMClick = useCallback(
        (event: SyntheticEvent, wemUrl: string) => {
            if (!wemUrl) {
                event.preventDefault();
                onWEMNotConfigured?.();
            }
        },
        [onWEMNotConfigured]
    );

    const updateWEMPath = useCallback(
        (engageGroups: ListGroupType, url: string) => {
            engageGroups.items.forEach((item) => {
                if (item.name === labels.WEM) {
                    item.path = url;
                    item.isLoading = false;
                    item.onClick = (event: SyntheticEvent) =>
                        handleWEMClick(event, item.path);
                }
            });
        },
        [handleWEMClick, labels.WEM]
    );

    useEffect(() => {
        if (!isOpenMenu && areGroupsLoaded) {
            return;
        }

        (async () => {
            const [permissions, routes] = await getPermissions(portalType);
            const isRedirectAllowed = await Navigation.getRedirectAllowed();
            const engageItems: ListItemType[] = getPermittedItems([
                {
                    name: labels.AGENT,
                    path: routes.Agent,
                    icon: AppSwitcherIcons.AGENT,
                    hasPermission: permissions.Agent,
                    openInNewTab:
                        UserService.isVodafoneBrand() || isRedirectAllowed,
                },
                {
                    name: labels.ANALYTICS,
                    path: routes.Analytics,
                    icon: AppSwitcherIcons.ANALYTICS,
                    hasPermission: permissions.Analytics,
                },
                {
                    name: labels.ADMIN,
                    path: routes.Admin,
                    icon: AppSwitcherIcons.ADMIN,
                    hasPermission: permissions.Admin,
                },
                {
                    name: labels.WEM,
                    path: routes.WEMEnterprise,
                    icon: AppSwitcherIcons.WEM_ENTERPRISE,
                    hasPermission: permissions.WEMEnterprise,
                    openInNewTab: await isWEMOpenInNewTab(portalType),
                    isLoading: true,
                },
                {
                    name: labels.AI,
                    path: routes.RingSense,
                    icon: AppSwitcherIcons.RING_SENSE,
                    hasPermission: permissions.RingSense,
                    openInNewTab: true,
                },
            ]);
            const engageGroup: ListGroupType = {
                items: engageItems,
            };
            setPermissionChecking(false);
            setAppGroups([engageGroup]);

            // This is done to avoid making API call again as we are using useEffect
            if (wemLoader.current) {
                return;
            }
            wemLoader.current = true;
            // To not block the thread we are using ."then" approach
            Navigation.getDynamicWEMUrl(portalType).then((url) => {
                wemLoader.current = false;
                const newEngageGroup = { ...engageGroup };
                updateWEMPath(newEngageGroup, url);
                setAppGroups([newEngageGroup]);
            });
        })();
    }, [
        rcAccountId,
        labels,
        areGroupsLoaded,
        isOpenMenu,
        portalType,
        handleWEMClick,
        updateWEMPath,
    ]);

    const renderMenu = useMemo(() => {
        return (
            <StyledIconButton
                isOpenMenu={isOpenMenu}
                aria-label={t('ARIA_LABELS.APP_SWITCHER')}
                aria-expanded={isOpenMenu}
                aria-haspopup='menu'
            >
                <AppSwitcherMenu />
            </StyledIconButton>
        );
    }, [isOpenMenu]);

    if (!appGroups || appGroups.flatMap((group) => group.items).length < 2) {
        return null;
    }
    return (
        <AppSwitcherWrapper data-aid={TEST_AID.APP_SWITCHER_TOGGLE}>
            {isLoading ? (
                <AppSwitcherBlank />
            ) : (
                <StyledPopper
                    toggleComponent={
                        accessibilityLabels?.appSwitcher ? (
                            <Tooltip
                                title={
                                    isOpenMenu
                                        ? accessibilityLabels.appSwitcher.close
                                        : accessibilityLabels.appSwitcher.open
                                }
                            >
                                {renderMenu}
                            </Tooltip>
                        ) : (
                            renderMenu
                        )
                    }
                    isOpen={isOpenMenu}
                    onOpen={toggleMenu}
                    onClose={toggleMenu}
                    disablePortal={true}
                    data-aid={TEST_AID.APP_SWITCHER}
                >
                    <List
                        items={appGroups}
                        onTrackAnalytics={onTrackAnalytics}
                    />
                </StyledPopper>
            )}
        </AppSwitcherWrapper>
    );
};

export default AppSwitcher;
