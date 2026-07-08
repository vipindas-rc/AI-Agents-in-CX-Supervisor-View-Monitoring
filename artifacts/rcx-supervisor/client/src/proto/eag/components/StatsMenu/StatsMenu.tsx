import type { MouseEventHandler } from 'react';
import { useMemo, useCallback, useState } from 'react';

import type { IMenu } from '@ringcx/ui';
import { Menu as MenuUI, Tooltip } from '@ringcx/ui';

import { StatsMenuStyled, StyledStatsLabel } from './StatsMenu.styled';
import { DownChevronTransformIcon } from '../../common/directives/dashboard/DownChevronTransformIcon';
import CreateAngularModule from '../../helpers/CreateAngularModule';

interface IStatsMenu {
    menuHeader: string;
    showDropdownIcon: boolean;
    options: IMenu['options'];
    selectedItemId: IMenu['selectedItemId'];
}

export const StatsMenu = ({
    menuHeader,
    showDropdownIcon,
    ...props
}: IStatsMenu) => {
    const [isShowTooltip, setShowTooltip] = useState<boolean>(false);

    const onMouseEnter: MouseEventHandler<HTMLSpanElement> = useCallback(
        ({ target }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setShowTooltip(target.offsetHeight < target.scrollHeight);
        },
        []
    );

    const toggleElement = useMemo(
        () =>
            isShowTooltip ? (
                <StatsMenuStyled onMouseEnter={onMouseEnter}>
                    <Tooltip title={menuHeader}>
                        <StyledStatsLabel>{menuHeader}</StyledStatsLabel>
                    </Tooltip>
                    <DownChevronTransformIcon showDropdown={showDropdownIcon} />
                </StatsMenuStyled>
            ) : (
                <StatsMenuStyled onMouseEnter={onMouseEnter}>
                    <StyledStatsLabel>{menuHeader}</StyledStatsLabel>
                    <DownChevronTransformIcon showDropdown={showDropdownIcon} />
                </StatsMenuStyled>
            ),
        [menuHeader, showDropdownIcon, isShowTooltip]
    );

    return <MenuUI toggleComponent={toggleElement} {...props} />;
};

export default CreateAngularModule('statsMenu', StatsMenu, [
    'options',
    'selectedItemId',
    'showDropdownIcon',
    'menuHeader',
]);
