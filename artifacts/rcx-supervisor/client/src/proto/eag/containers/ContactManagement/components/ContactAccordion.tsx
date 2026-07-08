import {
    useState,
    type SyntheticEvent,
    type PropsWithChildren,
    forwardRef,
} from 'react';

import { Accordion, AccordionHeader } from '@ringcentral/spring-ui';
import clsx from 'clsx';

import { ContactHeader, type ContactHeaderProps } from './ContactHeader';
import { MenuButton, type MenuButtonProps } from './MenuButton';

export type ContactAccordionProps = ContactHeaderProps &
    Partial<MenuButtonProps> & {
        testId?: string;
        expanded?: boolean;
        defaultExpanded?: boolean;
        keepMounted?: boolean;
        responsive?: boolean;
        expandedBottomBorder?: boolean;
        classes?: Partial<
            Record<'root' | 'expandedRoot' | 'panelInnerWrapper', string>
        >;
        onChange?: (event: SyntheticEvent, expanded: boolean) => void;
        handleDataTracking?: (isExpanded: boolean) => void; // handleDataTracking
    };

export const ContactAccordion = forwardRef<
    HTMLButtonElement,
    PropsWithChildren<ContactAccordionProps>
>(
    (
        {
            expanded: expandedProp,
            onChange: onChangeProp,
            defaultExpanded = false,
            title,
            subTitle,
            keepMounted,
            menuActions,
            children,
            testId = '',
            responsive = false,
            expandedBottomBorder = false,
            classes,
            handleDataTracking,
        },
        ref
    ) => {
        const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

        const onAccordionChange: typeof onChangeProp = (...args) => {
            const isExpanded = args[1];
            onChangeProp?.(...args);
            setExpanded(isExpanded);
            handleDataTracking && handleDataTracking(isExpanded);
        };

        const actionBlock = menuActions?.length ? (
            <MenuButton ref={ref} menuActions={menuActions} />
        ) : null;

        const isExpanded = expandedProp === undefined ? expanded : expandedProp;

        return (
            <Accordion
                data-aid={testId}
                expanded={isExpanded}
                onChange={onAccordionChange}
                defaultExpanded={defaultExpanded}
                keepMounted={keepMounted}
                header={
                    <AccordionHeader
                        classes={{
                            content: 'flex-grow justify-between pr-4',
                            root: clsx(
                                'min-h-16 h-auto border-neutral-b4-t50 border-0 border-b border-solid py-2.5',
                                isExpanded && 'bg-neutral-b5'
                            ),
                        }}
                        secondarySlot={actionBlock}
                    >
                        <ContactHeader title={title} subTitle={subTitle} />
                    </AccordionHeader>
                }
                classes={{
                    root: clsx(
                        '!mt-0',
                        expanded &&
                            responsive && [
                                'flex flex-col',
                                classes?.expandedRoot,
                            ]
                    ),
                    panelWrapper: clsx(
                        expandedBottomBorder &&
                            expanded &&
                            'border-neutral-b4-t50 border-0 border-b border-solid',
                        responsive && 'flex-grow flex-shrink basis-0'
                    ),
                    panelInnerWrapper: clsx(
                        responsive && 'overflow-y-auto h-full',
                        classes?.panelInnerWrapper
                    ),
                }}
            >
                {children}
            </Accordion>
        );
    }
);

ContactAccordion.displayName = 'ContactAccordion';
