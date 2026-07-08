import type { ReactPortal } from 'react';
import { useContext, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { CtaButton, TopHatStyled, CloseButton } from './TopHat.styled';
import { TEST_AID } from '../../../constants';
import { CloseSvg, ExternalLinkIcon } from '../../../icons';
import TopHatContext from '../TopHatContext';
import type { IActionButton, ICloseActionButton } from '../types';

type TopHatProps = {
    containerId?: string;
};

const TopHat = ({ containerId }: TopHatProps): ReactPortal | null => {
    const [topHatState] = useContext(TopHatContext);
    const [container, setContainer] = useState<Element | null>(() =>
        containerId ? null : createRootElement('topHatContainer')
    );

    useEffect(() => {
        if (containerId) {
            const customContainer = document.getElementById(containerId);
            if (customContainer) {
                setContainer(customContainer);
            } else {
                setContainer(createRootElement('topHatContainer'));
            }
        }
    }, [containerId]);

    if (!container) {
        return null;
    }

    const { current } = topHatState.deref;

    // If there's no current tophat to display, don't calculate stuff.
    if (!current) {
        return createPortal(null, container);
    }

    const { options = {} } = current;

    const topHat = (
        <TopHatStyled {...{ type: options.type }}>
            <div data-aid={TEST_AID.TOPHAT}>
                <span>{current.text}</span>
                {options &&
                    options.primary &&
                    buildCtaButton(
                        options.primary,
                        TEST_AID.TOPHAT_ACTION_PRIMARY
                    )}
                {options &&
                    options.secondary &&
                    buildCtaButton(
                        options.secondary,
                        TEST_AID.TOPHAT_ACTION_SECONDARY
                    )}
                {options &&
                    options.closeWithX &&
                    buildCloseButton(options.closeWithX)}
            </div>
        </TopHatStyled>
    );

    return createPortal(topHat, container);
};

const buildCtaButton = (buttonType: IActionButton, testAid: string) => {
    return (
        <CtaButton data-aid={testAid} onClick={buttonType.action}>
            <span>{buttonType.actionTitle}</span>
            {buttonType.external && <ExternalLinkIcon />}
        </CtaButton>
    );
};

const buildCloseButton = (buttonType: ICloseActionButton) => {
    return (
        <CloseButton
            data-aid={TEST_AID.TOPHAT_CLOSE_BUTTON}
            onClick={buttonType.action}
        >
            <CloseSvg />
        </CloseButton>
    );
};

const createRootElement = (id: string) => {
    const existingElem = document.querySelector(`#${id}`);

    if (existingElem == null) {
        const rootContainer = document.createElement('div');
        rootContainer.setAttribute('id', id);

        if (document.body.firstChild) {
            document.body.insertBefore(rootContainer, document.body.firstChild);
        }

        return rootContainer;
    } else {
        return existingElem;
    }
};

export default TopHat;
