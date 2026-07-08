import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { copyToClipboard, isCopyAllowed, Menu, More } from '@ringcx/ui';

import { COPY_CALL_ID_MENU } from '../../../constants/testIds';
import { StyledIconButton } from '../../../containers/SupervisorAgentList/components/Menus/Menus.styled';
import CreateAngularModule from '../../../helpers/CreateAngularModule';
import translate from '../../../helpers/translate';
import { isValidCallId } from '../../../helpers/utils';

const FOCUS_DELAY_MS = 50;

export const CallIdMenu: FC<{
    callId: string;
    confirmation: () => void;
    focusOnMount?: boolean;
}> = ({ callId, confirmation, focusOnMount = false }) => {
    const IsCopyAllowed = isCopyAllowed();
    const [isOpen, setIsOpen] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        IsCopyAllowed.then(setIsAllowed);
    }, []);

    useEffect(() => {
        if (focusOnMount && isAllowed && buttonRef.current) {
            const timer = setTimeout(() => {
                buttonRef.current?.focus();
            }, FOCUS_DELAY_MS);
            return () => clearTimeout(timer);
        }
    }, [focusOnMount, isAllowed]);

    const copyCallId = useCallback(() => {
        copyToClipboard(callId).then((success) => {
            if (success) {
                confirmation();
            }
        });
    }, [callId]);

    const options = useMemo(
        () => [
            {
                id: callId,
                title: translate('WIDGETS.MONITOR.COPY_CALL_ID'),
                action: () => {
                    copyCallId();
                },
            },
        ],
        [callId]
    );

    const toggleComponent = useMemo(() => {
        return (
            <StyledIconButton
                ref={buttonRef}
                data-aid={COPY_CALL_ID_MENU}
                {...{
                    disableRipple: true,
                    size: 'medium',
                }}
                aria-label={translate('ARIA_LABELS.COPY_CALL_ID')}
            >
                <More />
            </StyledIconButton>
        );
    }, []);
    if (isAllowed && isValidCallId(callId)) {
        return (
            <Menu
                {...{
                    options,
                    toggleComponent,
                    isOpen,
                    onClose: () => setIsOpen(false),
                    disablePortal: true,
                    disableAutoFocusItem: true,
                }}
            />
        );
    }
    return null;
};
export default CreateAngularModule(
    'callIdMenu',
    CallIdMenu,
    ['callId', 'confirmation', 'focusOnMount'],
    []
);
