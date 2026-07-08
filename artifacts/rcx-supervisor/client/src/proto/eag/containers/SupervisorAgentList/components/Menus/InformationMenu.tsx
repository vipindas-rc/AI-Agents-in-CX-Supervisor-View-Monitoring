import { Fragment, type Dispatch, type SetStateAction } from 'react';

import { Information, Tooltip } from '@ringcx/ui';

import {
    StyledInformationButton,
    StyledToolTipLinkButton,
} from './Menus.styled';
import { RC_SUPPORT_DOMAIN, RC_SUPPORT_LINK } from '../../../../constants/app';
import translate from '../../../../helpers/translate';

const InformationMenu = ({
    setIsInfoToolTipVisible,
}: {
    setIsInfoToolTipVisible: Dispatch<SetStateAction<boolean>>;
}) => {
    const toolTipTitle = (
        <Fragment>
            {`${translate('MONITORING.TOOL_TIP.INFORMATION')} (`}
            <StyledToolTipLinkButton
                target='_blank'
                href={`${RC_SUPPORT_DOMAIN}${RC_SUPPORT_LINK.DIGITAL_ENABLE_SUPERVISOR}`}
                rel='noreferrer'
            >
                {translate('MONITORING.TOOL_TIP.LEARN_MORE')}
            </StyledToolTipLinkButton>
            {')'}
        </Fragment>
    );

    const handleTooltipOpen = () => {
        setIsInfoToolTipVisible(true);
    };

    const handleTooltipClose = () => {
        setIsInfoToolTipVisible(false);
    };

    return (
        <Tooltip
            title={toolTipTitle}
            placement='bottom'
            interactive={true}
            onOpen={handleTooltipOpen}
            onClose={handleTooltipClose}
        >
            <StyledInformationButton
                {...{
                    size: 'medium',
                }}
            >
                <Information data-aid='eui-information' />
            </StyledInformationButton>
        </Tooltip>
    );
};
export default InformationMenu;
