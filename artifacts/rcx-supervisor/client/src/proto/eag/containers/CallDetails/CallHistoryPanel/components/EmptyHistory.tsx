import type { FC } from 'react';

import {
    EmptyHistoryStyled,
    EmptyHistoryContentStyle,
} from '../../../../components/CallDetailsPanel/CallDetailsPanel.styled';
import translate from '../../../../helpers/translate';

export const EmptyHistory: FC = () => {
    const emptyHistoryText = translate('CURRENT_CALL.HISTORY.EMPTY_HISTORY');
    return (
        <EmptyHistoryStyled>
            <EmptyHistoryContentStyle>
                {emptyHistoryText}
            </EmptyHistoryContentStyle>
        </EmptyHistoryStyled>
    );
};
