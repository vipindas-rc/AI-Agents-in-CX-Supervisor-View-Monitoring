import type { FC } from 'react';

import { Wrapper } from './DispositionSubmittedPanel.styled';
import type { IDispositionSubmittedPanel } from './types/DispositionSubmittedPanel';
import { DispositionSubmittedSplash } from '../../components/DispositionSubmittedSplash/DispositionSubmittedSplash';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const DispositionSubmittedPanel: FC<IDispositionSubmittedPanel> = ({
    messageText,
    messageSubText,
}) => {
    return (
        <Wrapper>
            <DispositionSubmittedSplash
                {...{
                    messageText,
                    messageSubText,
                }}
            />
        </Wrapper>
    );
};

export default CreateAngularModule(
    'dispositionSubmittedPanel',
    DispositionSubmittedPanel,
    ['messageText', 'messageSubText'],
    []
);
