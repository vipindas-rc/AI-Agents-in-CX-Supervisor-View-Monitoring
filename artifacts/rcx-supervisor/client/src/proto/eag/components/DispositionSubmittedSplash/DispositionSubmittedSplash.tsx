import { Fragment, type FC } from 'react';

import { DispositionSubmittedState } from './assets/DispositionSubmittedState';
import {
    MessageSubText,
    MessageText,
} from './DispositionSubmittedSplash.styled';
import type { IDispositionSubmittedSplash } from './types/DispositionSubmittedSplash';
import translate from '../../helpers/translate';

export const DispositionSubmittedSplash: FC<IDispositionSubmittedSplash> = ({
    messageText,
    messageSubText,
}) => {
    const message = messageText,
        splashImage = <DispositionSubmittedState />,
        messageSubTxt = messageSubText || null;

    return (
        <Fragment>
            {splashImage}
            <MessageText>{translate(message)}</MessageText>
            {messageSubTxt && (
                <MessageSubText>{translate(messageSubTxt)}</MessageSubText>
            )}
        </Fragment>
    );
};
