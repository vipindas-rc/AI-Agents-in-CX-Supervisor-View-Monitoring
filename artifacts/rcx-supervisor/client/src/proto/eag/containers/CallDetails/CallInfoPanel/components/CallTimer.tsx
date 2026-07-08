import { Fragment, type FC } from 'react';

import { InboundCallAlt, OutboundCallAlt } from '@ringcx/ui';

import { CallIconStyled, CallTime } from './CallTimer.styled';
import { CALL_TIME } from '../../../../constants/testIds';
import { hhMmSsFilter } from '../../../../helpers/timeUtils';
import type { ICallTimer } from '../types/CallInfoPanel';

export const CallTimer: FC<ICallTimer> = ({ callType, duration }) => {
    const isInbound = callType === 'INBOUND';
    //design is in the process up updating these colors, when that is done they
    //will be added to the theme and incorporated into a styled component
    const phoneIcon = isInbound ? (
        <InboundCallAlt style={{ color: '#BDBDBD' }} />
    ) : (
        <OutboundCallAlt style={{ color: '#BDBDBD' }} />
    );

    return (
        <Fragment>
            <CallIconStyled> {phoneIcon} </CallIconStyled>
            <CallTime data-aid={CALL_TIME}> {hhMmSsFilter(duration)}</CallTime>
        </Fragment>
    );
};
